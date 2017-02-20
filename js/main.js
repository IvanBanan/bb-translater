"use strict";

//модуль переводчик
var Translater = (function () {
    var arrSentences, defaultOptions;

    defaultOptions = {
        sQuerySelector: '[translate]',

    };

    function init(objOptions) {
        var key;
        //        применение опций к модулю
        for (key in defaultOptions) {
            if (!objOptions[key]) {
                objOptions[key] = defaultOptions[key];
            }
        }
//        пока так загружается список предложений. хочу хранить их в объекте потом
        arrSentences = Array.prototype.slice.call(document.querySelectorAll(objOptions.sQuerySelector));
        //навешиваем обработчики на предложения
        arrSentences.forEach(function (elem) {
            elem.addEventListener('click', sentenceClick);
        });
    }

    function sentenceClick(e) {
        var oSentence, sentenceId, oEditor, oCloseBtn;
        oSentence = this;
        sentenceId = this.attributes['sentence-id'].value;
        oEditor = document.querySelector("[editor-id='" + sentenceId + "']");

        if (!oEditor) {
            //клонируем шаблон редактора
            oEditor = document.querySelector('[editor-id="template"]').cloneNode(true);
            oEditor.setAttribute('editor-id', sentenceId);
            oSentence.classList.add("active");
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
            });
        } else {
            oEditor.classList.toggle("active");
            oSentence.classList.toggle("active");
        }


    }


    return {
        init: init
    }

}());


window.addEventListener('load', function (e) {
    Translater.init({
        sQuerySelector: '[to-translate]'
    });
});