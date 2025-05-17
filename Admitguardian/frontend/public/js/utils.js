import 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js';
import 'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.4.2/mammoth.browser.min.js';

class LoadingManager {
    constructor(onLoad, onProgress, onError) {
        this.isLoading = false;
        this.itemsLoaded = 0;
        this.itemsTotal = 0;
        this.urlModifier = undefined;
        this.handlers = [];

        this.onStart = undefined;
        this.onLoad = onLoad;
        this.onProgress = onProgress;
        this.onError = onError;
    }

    itemStart(url) {
        this.itemsTotal++;
        if (this.isLoading === false) {
            if (this.onStart !== undefined) {
                this.onStart(url, this.itemsLoaded, this.itemsTotal);
            }
        }
        this.isLoading = true;
    }

    itemEnd(url) {
        this.itemsLoaded++;
        if (this.onProgress !== undefined) {
            this.onProgress(url, this.itemsLoaded, this.itemsTotal);
        }
        if (this.itemsLoaded === this.itemsTotal) {
            this.isLoading = false;
            if (this.onLoad !== undefined) {
                this.onLoad();
            }
        }
    }

    itemError(url) {
        if (this.onError !== undefined) {
            this.onError(url);
        }
    }

    resolveURL(url) {
        if (this.urlModifier) {
            return this.urlModifier(url);
        }
        return url;
    }

    setURLModifier(transform) {
        this.urlModifier = transform;
        return this;
    }

    addHandler(regex, loader) {
        this.handlers.push(regex, loader);
        return this;
    }

    removeHandler(regex) {
        const index = this.handlers.indexOf(regex);
        if (index !== -1) {
            this.handlers.splice(index, 2);
        }
        return this;
    }

    getHandler(file) {
        for (let i = 0, l = this.handlers.length; i < l; i += 2) {
            const regex = this.handlers[i];
            const loader = this.handlers[i + 1];
            if (regex.global)
                regex.lastIndex = 0;
            if (regex.test(file)) {
                return loader;
            }
        }
        return null;
    }
}

class FileLoader {
    constructor() {
        this.reader = new FileReader();
        this.loadCallback = () => { alert('a') };
    }

    loadFile(file) {
        let _this = this;
        let filename = file.name;
        let ext = filename.split('.').pop().toLowerCase();
        let spinner = EQuery.elemt('div', null, 'app-spinner').spinner();
        this.modal = new openModal({ content: [{ 'm2': { html: spinner }, 'm8': { text: { elt: document.createTextNode('Uploading file') } } }] });


        this.reader.onprogress = function (event) {
            let size = `(${Math.floor(event.total / 1000)} KB)`;
            let progress = `${Math.floor((event.loaded / event.total) * 100)}%`;
            console.log('Loading', filename, size, progress);
        };

        this.reader.onload = function (event) {
            _this.modal.close();
            _this.loadCallback(event.target.result, filename.split('.')[0], ext);
        };

        this.reader.readAsDataURL(file);
    }

    loadFiles(files, filesMap) {
        if (files.length > 0) {
            filesMap = filesMap || this.createFileMap(files);
            let manager = new LoadingManager();
            manager.setURLModifier(function (url) {
                url = url.replace(/^(\.?\/)/, '');
                let file = filesMap[url];
                if (file) {
                    console.log('Loading: ', url);
                    return URL.createObjectURL(file);
                }
                return url;
            });
            for (let i = 0; i < files.length; i++) {
                this.loadFile(files[i], manager);
            }
        }
    }

    createFileMap(files) {
        let map = {};
        for (let i = 0; i < files.length; i++) {
            let file = files[i];
            map[file.name] = file;
        }
        return map;
    }

    loadItemList(items) {
        let _this = this;
        this.getFilesFromItemList(items, function (files, filesMap) {
            _this.loadFiles(files, filesMap);
        });
    }

    getFilesFromItemList(items, onDone) {
        let itemsCount = 0;
        let itemsTotal = 0;
        let files = [];
        let filesMap = {};

        function onEntryHandled() {
            itemsCount++;
            if (itemsCount === itemsTotal) {
                onDone(files, filesMap);
            }
        }

        function handleEntry(entry) {
            if (entry.isDirectory) {
                let reader = entry.createReader();
                reader.readEntries(function (entries) {
                    for (let i = 0; i < entries.length; i++) {
                        handleEntry(entries[i]);
                    }
                    onEntryHandled();
                });
            } else if (entry.isFile) {
                entry.file(function (file) {
                    files.push(file);
                    filesMap[entry.fullPath.substr(1)] = file;
                    onEntryHandled();
                });
            }
            itemsTotal++;
        }

        for (let i = 0; i < items.length; i++) {
            let item = items[i];
            if (item.kind === 'file') {
                handleEntry(item.webkitGetAsEntry());
            }
        }
    }

    onLoaded(callback) {
        this.loadCallback = callback;
        console.trace(this.loadCallback)
    }

    toBlob(dataUrl) {
        const [header, base64] = dataUrl.split(',');
        const mine = header.match(/:(.*?);/)[1];
        const binary = atob(base64);
        const array = new Uint8Array(binary.length);

        for (let i = 0; i < binary.length; i++) {
            array[i] = binary.charCodeAt(i);
        }

        return new Blob([array], { type: mine });
    }
}

class openModal {
    constructor(data) {
        this.parent = EQuery('.app-overlay');
        let _this = this;

        this.modalBottom = EQuery.elemt('div', null, 'app-modal-bottom e-flex justify-evenly app-row');
        this.modalHeader = EQuery.elemt('div', [EQuery.elemt('div', [EQuery.elemt('div', null, 'title', null, 'margin-left: 8px')], 'app-modal-title e-flex item-center justify-between', null, 'width: 100%;')], 'app-modal-header', { id: 'dragable-header' }, 'border-top-left-radius: 12px;border-top-right-radius: 12px');
        this.modalContent = EQuery.elemt('div', null, 'app-modal-content');
        this.elt = EQuery.elemt('div', null, 'app-modal m-sw', { id: 'dragable' });

        if (data.header !== undefined) this.modalHeader.find('.title').text(data.header);
        else this.modalHeader.css('height: 0px;margin: 0');

        this.elt.append(this.modalHeader);

        if (data.content !== undefined) {
            if (typeof data.content === 'object') {
                for (let i = 0; i < data.content.length; i++) {
                    let row = EQuery.elemt('div', null, 'app-row app-clear');
                    this.modalContent.append(row);

                    for (let col in data.content[i]) {
                        let column = EQuery.elemt('div', null, `app-col ${col}`);
                        row.append(column);
                        if (typeof data.content[i][col] === 'object') {
                            for (let g in data.content[i][col]) {
                                if (g === 'html') {
                                    this[g] = data.content[i][col][g];
                                    column.append(data.content[i][col][g]);
                                } else {
                                    this[g] = data.content[i][col][g];
                                    column.append(data.content[i][col][g].elt);
                                }
                            }
                        } else {
                            column.append(EQuery.elemt('div', data.content[i][col], 'app-modal-text'));
                        }
                    }
                }
            } else {
                this.modalContent.append(EQuery.elemt('div', data.content, 'app-modal-text'));
            }
            this.elt.append(this.modalContent);
        }

        if (data.btns) {
            for (let btn in data.btns) {
                let _btn = EQuery.elemt('button', btn, 'app-modal-btn button-root app-col');
                _btn.func = data.btns[btn];
                this.modalBottom.append(_btn);

                _btn.click(function () {
                    this.func(_this);
                });
            }
            this.elt.append(this.modalBottom);
        }

        this.parent.removeChildren();
        this.parent.show();
        this.parent.append(this.elt);
        this.elt.dragElement();
    }

    close() {
        this.parent.rmChild(this.elt);
        this.parent.hide();
        this.elt.remove();
    }
}

class openModal2 {
    constructor(data) {
        this.parent = EQuery('.app-overlay'); window.modal = this
        let i = 0;
        let _this = this;

        this._close = EQuery.elemt('div', [EQuery.elemt('a', null, 'icon icon-close', null, 'color: inherit;padding: 2px;padding-top: 5px;width: 30px;height: 20px;font-size: 20px;cursor: pointer;')], null, null, 'position: relative;z-index: 3000;app-region: no-drag;height: 100%;margin-right: 4px;');
        this.modalBottom = EQuery.elemt('div', null, 'app-modal-bottom e-flex justify-evenly app-row');
        this.modalHeader = EQuery.elemt('div', [EQuery.elemt('div', [EQuery.elemt('div', null, 'title', null, 'margin-left: 8px'), this._close], 'app-modal-title e-flex item-center justify-between', null, 'width: 100%;')], 'app-modal-header', { id: 'dragable-header' }, 'border-top-left-radius: 12px;border-top-right-radius: 12px');
        this.modalContent = EQuery.elemt('div', null, 'app-modal-content');
        this.elt = EQuery.elemt('div', null, 'app-modal m-sw', { id: 'dragable' });
        this._close.click(function () {
            _this.close();
        });

        if (data.header !== undefined) this.modalHeader.find('.title').text(data.header);
        EQuery(this.elt).append(this.modalHeader);

        if (data.content !== undefined) {
            if (typeof data.content === 'object') {
                for (let i = 0; i < data.content.length; i++) {
                    let row = EQuery.elemt('div', null, 'app-row');
                    this.modalContent.append(row);

                    for (let col in data.content[i]) {
                        let column = EQuery.elemt('div', null, `app-col ${col}`);
                        row.append(column);
                        if (typeof data.content[i][col] === 'object') {
                            for (let g in data.content[i][col]) {
                                if (g === 'html') {
                                    this[g] = data.content[i][col][g];
                                    column.append(data.content[i][col][g]);
                                } else {
                                    this[g] = data.content[i][col][g];
                                    column.append(data.content[i][col][g].elt);
                                }
                            }
                        } else {
                            column.append(EQuery.elemt('div', data.content[i][col], 'app-modal-text'));
                        }
                    }
                }
            } else {
                this.modalContent.append(EQuery.elemt('div', data.content, 'app-modal-text'));
            }
            this.elt.append(this.modalContent);
        }

        if (data.btns) {
            for (let btn in data.btns) {
                let _btn = EQuery.elemt('button', btn, 'app-modal-btn button-root app-col');
                _btn.func = data.btns[btn];
                this.modalBottom.append(_btn);

                _btn.click(function () {
                    this.func(_this);
                });
            }
            this.elt.append(this.modalBottom);
        }

        this.parent.removeChildren();
        this.parent.show();
        this.parent.append(this.elt);
        this.elt.dragElement();
    }

    close() {
        this.parent.rmChild(this.elt);
        this.parent.hide();
        this.elt.remove();
    }
}

async function extractTextFromPDFBlob(blob) {
    const arrayBuffer = await blob.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";
  
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(" ");
        fullText += pageText + "\n";
    }
  
    return fullText;
}

async function extractTextFromPdfDataUrl(dataUrl) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
    const loadingTask = pdfjsLib.getDocument({ data: atob(dataUrl.split(',')[1]) });
    const pdf = await loadingTask.promise;
  
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const text = textContent.items.map(item => item.str).join(' ');
      fullText += text + '\n';
    }
  
    return fullText;
}

async function extractTextFromDocxDataUrl(dataUrl) {
    const base64 = dataUrl.split(',')[1];
    const arrayBuffer = Uint8Array.from(atob(base64), c => c.charCodeAt(0)).buffer;
  
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
}

async function extractTextFromDataUrl(dataUrl, callback) {
    let fileContent = '';
    const [header] = dataUrl.split(',');
    const mimeType = header.match(/:(.*?);/)[1];
    if (mimeType === 'application/pdf') {
        fileContent = await extractTextFromPdfDataUrl(dataUrl);
    } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        fileContent = await extractTextFromDocxDataUrl(dataUrl);
    } else if (mimeType ==='text/plain') {
        fileContent = await blob.text();
    } else {
        new openModal2({ header: 'Invalid file format', content: [{ 'm12': { text: {elt: document.createTextNode('Only accepts the following file formats: *.txt, *.text, *.pdf, *.docx')} } }] });
        throw new Error('Unsupported file type: ' + mimeType);
    }

    callback(fileContent);
}

function extractMimeType(dataUrl) {
    const [header] = dataUrl.split(',');
    const mimeType = header.match(/:(.*?);/)[1];
    return mimeType;
}

async function submitEssay(essayText, callback) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    let raw = JSON.stringify({"essay_text": essayText});
    let requestOptions = {method: 'POST', headers: headers, body: raw, redirect: 'follow'};

    let response = await(await fetch("https://lyrical-mnn5.onrender.com/essay/evaluate", requestOptions)).json().catch(e => { throw new Error(e) });
    callback(response);
}

async function submitResume(resumeText, callback) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    let raw = JSON.stringify({"resume_text": resumeText});
    let requestOptions = {method: 'POST', headers: headers, body: raw, redirect: 'follow'};

    let response = await(await fetch("https://lyrical-mnn5.onrender.com/resume/evaluate", requestOptions)).json().catch(e => { throw new Error(e) });
    callback(response);
}

async function checkTone(text, callback) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    let raw = JSON.stringify({"text": text});
    let requestOptions = {method: 'POST', headers: headers, body: raw, redirect: 'follow'};

    let response = await(await fetch("https://lyrical-mnn5.onrender.com/evaluate/tone", requestOptions)).json().catch(e => { throw new Error(e) });
    callback(response);
}

async function generateChecklist(essayText, resumeText, targetUniversities, callback) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    let raw = JSON.stringify({"essay_text": essayText, "resume_text": resumeText, "target_universities": targetUniversities});
    let requestOptions = {method: 'POST', headers: headers, body: raw, redirect: 'follow'};

    let response = await(await fetch("https://lyrical-mnn5.onrender.com/checklist/generate", requestOptions)).json().catch(e => { throw new Error(e) });
    callback(response);
}

async function requestLiveAlerts(text, mimeType, callback) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    let raw = JSON.stringify({"document_type": mimeType, "document_text": text});
    let requestOptions = {method: 'POST', headers: headers, body: raw, redirect: 'follow'};

    let response = await(await fetch("https://lyrical-mnn5.onrender.com/alerts/live-alerts", requestOptions)).json().catch(e => { throw new Error(e) });
    callback(response);
}

async function checkScore(callback) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    let requestOptions = {method: 'GET', headers: headers, redirect: 'follow'};

    let response = await(await fetch("https://lyrical-mnn5.onrender.com/dashboard/score", requestOptions)).json().catch(e => { throw new Error(e) });
    callback(response);
}

async function questDaily(callback) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    let raw = JSON.stringify({});
    let requestOptions = {method: 'GET', headers: headers, body: raw, redirect: 'follow'};

    let response = await(await fetch("https://lyrical-mnn5.onrender.com/quest/daily", requestOptions)).json().catch(e => { throw new Error(e) });
    callback(response);
}

async function questUpdate(callback) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    let raw = JSON.stringify({});
    let requestOptions = {method: 'GET', headers: headers, body: raw, redirect: 'follow'};

    let response = await(await fetch("https://lyrical-mnn5.onrender.com/quest/update", requestOptions)).json().catch(e => { throw new Error(e) });
    callback(response);
}

async function questReset(callback) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    let raw = JSON.stringify({});
    let requestOptions = {method: 'GET', headers: headers, body: raw, redirect: 'follow'};

    let response = await(await fetch("https://lyrical-mnn5.onrender.com/quest/reset", requestOptions)).json().catch(e => { throw new Error(e) });
    callback(response);
}

export { FileLoader, openModal, openModal2, extractTextFromDataUrl, extractMimeType, submitEssay, submitResume, checkTone, generateChecklist, requestLiveAlerts, checkScore, questDaily, questReset, questUpdate };