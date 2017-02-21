"use strict";

//модуль переводчик
var Translater = (function () {
    var sOriginalText, defaultOptions, oSentences;

    defaultOptions = {
        sQuerySelector: '[translate]'
        
    };


    function prepareSentences(sId) {

        //запрос пока к заглушке, возращающий подготовленные предложения. потом будет обращение к api
        JSON.parse(sendAjax({
            url: 'json/data.json',
            callback: callBack
        }));

        function callBack(xhr) {
            oSentences = JSON.parse(xhr.responseText);
            buildDOMSentences(sId);
            initClickHandler()
        }
    }

    function buildDOMSentences(sId) {
        var key, buffP, buffS, domSentCont;
        domSentCont = document.querySelector('#' + sId);
        if (!domSentCont) {
            return;
        }

        for (key in oSentences) {
            //проверяем существует ли параграф. если нет, то создаем, если да, то суем в него
            buffP = document.querySelector('[paragraph-id="' + oSentences[key].paragraph_id + '"]');
            if (!buffP) {
                buffP = document.createElement('p');
                buffP.classList.add('paragraph');
                buffP.setAttribute('paragraph-id', oSentences[key].paragraph_id);
                domSentCont.appendChild(buffP);
            }

            //создаем предложение span вида <span class="sentence" sentence-id="7" to-translate="">text</span> и в параграф его
            buffS = document.createElement('span');
            buffS.classList.add('sentence');
            buffS.setAttribute('sentence-id', key);
            buffS.setAttribute('to-translate', '');
            buffS.innerHTML = oSentences[key].original_content;

            buffP.appendChild(buffS);
            oSentences[key].sentence = buffS;
            oSentences[key].paragraph = buffP;
        }
    }

    function sendAjax(xhrOptions) {
        var xhr, key, defOpt;
        xhr = new XMLHttpRequest();
        defOpt = {
            method: 'get',
            url: '',
            async: true,
            callback: null
        };

        if (!xhrOptions) {
            return;
        } else {
            //добиваем недостающие параметры XHR
            for (key in defOpt) {
                if (!xhrOptions[key]) {
                    xhrOptions[key] = defOpt[key];
                }
            }
        }

        xhr.open(xhrOptions['method'], xhrOptions['url'], xhrOptions['async']);
        xhr.send();

        xhr.onreadystatechange = function () {
            if (this.readyState != 4) return;

            if (this.status != 200) {
                // обработать ошибку
                alert('ошибка: ' + (this.status ? this.statusText : 'запрос не удался'));
                return;
            }

            if (xhrOptions['callback']) {
                xhrOptions['callback'](xhr);
            }
            // по окончании запроса доступны:
            // status, statusText
            // responseText, responseXML (при content-type: text/xml)
            // получить результат из this.responseText или this.responseXML


        }
    }


    function initClickHandler() {
        var key;
        //навешиваем обработчики на предложения
        for(key in oSentences){
            oSentences[key].sentence.addEventListener('click', sentenceClick);
        };
        
    }

    function sentenceClick(e) {
        var oSentence, sentenceId, oEditor, oCloseBtn, oAutoTran, oHumanTran;
        oSentence = this;
        sentenceId = this.attributes['sentence-id'].value;
        oEditor = document.querySelector("[editor-id='" + sentenceId + "']");

        if (!oEditor) {
            //клонируем шаблон редактора
            oEditor = document.querySelector('[editor-id="template"]').cloneNode(true);
            oEditor.setAttribute('editor-id', sentenceId);
            oAutoTran = oEditor.querySelector('[auto-translate-id="template"]');
            oAutoTran.setAttribute('auto-translate-id', sentenceId);
            oAutoTran.innerHTML = oSentences[sentenceId]['auto_translate'];
            oHumanTran = oEditor.querySelector('[human-translate-id="template"]');
            oHumanTran.setAttribute('human-translate-id', sentenceId);
            oHumanTran.innerHTML = oSentences[sentenceId]['auto_translate'];
//            не забыть поменять костыль
            
//            oSentence.classList.add("active");
            oSentence.after(oEditor);

            // с задержкой для анимации
            setTimeout(function () {
                oEditor.classList.add('active');
            }, 100);

            oCloseBtn = oEditor.querySelector('[close-editor-id]');
            oCloseBtn.setAttribute('close-editor-id', sentenceId);
            oCloseBtn.addEventListener("click", function (e) {
                oEditor.classList.remove("active");
                oSentence.classList.remove("active");
                oHumanTran.blur();
            });
            oHumanTran.addEventListener("blur", function (e) {
                oSentences[sentenceId]['human_translate'] = oHumanTran.value;
            });
            
        } else {
            oEditor.classList.toggle("active");
        }
        
        oSentence.classList.toggle("active");
        
        
    }



    //    старые обработчики клика

    //    //навешиваем обработчики на предложения, размещенные в контейнере для перевода
    //    function initClickHandler(objOptions) {
    //        var key;
    //        //        применение опций к модулю
    //        for (key in defaultOptions) {
    //            if (!objOptions[key]) {
    //                objOptions[key] = defaultOptions[key];
    //            }
    //        }
    //        //        пока так загружается список предложений. хочу хранить их в объекте потом
    //        arrSentences = Array.prototype.slice.call(document.querySelectorAll(objOptions.sQuerySelector));
    //        //навешиваем обработчики на предложения
    //        arrSentences.forEach(function (elem) {
    //            elem.addEventListener('click', sentenceClick);
    //        });
    //    }
    //
    //    function sentenceClick(e) {
    //        var oSentence, sentenceId, oEditor, oCloseBtn;
    //        oSentence = this;
    //        sentenceId = this.attributes['sentence-id'].value;
    //        oEditor = document.querySelector("[editor-id='" + sentenceId + "']");
    //
    //        if (!oEditor) {
    //            //клонируем шаблон редактора
    //            oEditor = document.querySelector('[editor-id="template"]').cloneNode(true);
    //            oEditor.setAttribute('editor-id', sentenceId);
    //            oSentence.classList.add("active");
    //            oSentence.after(oEditor);
    //
    //            // с задержкой для анимации
    //            setTimeout(function () {
    //                oEditor.classList.add('active');
    //            }, 100);
    //
    //            oCloseBtn = oEditor.querySelector('[close-editor-id]');
    //            oCloseBtn.setAttribute('close-editor-id', sentenceId);
    //            oCloseBtn.addEventListener("click", function (e) {
    //                oEditor.classList.remove("active");
    //                oSentence.classList.remove("active");
    //            });
    //        } else {
    //            oEditor.classList.toggle("active");
    //            oSentence.classList.toggle("active");
    //        }
    //
    //
    //    }


    return {
        initClickHandler: initClickHandler,
        prepareSentences: prepareSentences
    }

}());


window.addEventListener('load', function (e) {
    //    Translater.prepareSentences('original-text');
    Translater.prepareSentences('sentence-container');
//    Translater.initClickHandler({
//        sQuerySelector: '[to-translate]'
//    });
});