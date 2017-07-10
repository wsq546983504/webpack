define(function () {
    function list(data) {
        var list = require('list.pug');
        var objData = data;       
        var html = list(objData);
        console.log(html);
        document.getElementById("J_listBox").innerHTML = html;
    }

    return list;
});