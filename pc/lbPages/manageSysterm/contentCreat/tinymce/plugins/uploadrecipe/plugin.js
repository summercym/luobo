tinymce.PluginManager.add('uploadrecipe', function (editor) {

    function selectLocalImages() {
        // var dom = editor.dom;
        // var input_f = $('<input type="file" name="thumbnail" accept="image/jpg,image/jpeg,image/png,image/gif" multiple="multiple">');
        // input_f.on('change', function () {
        //     var form = $("<form/>",
        //         {
        //             action: editor.settings.upload_image_url, //设置上传图片的路由，配置在初始化时
        //             style: 'display:none',
        //             method: 'post',
        //             enctype: 'multipart/form-data'
        //         }
        //     );
        //     form.append(input_f);
        //     //ajax提交表单
        //     form.ajaxSubmit({
        //         beforeSubmit: function () {
        //             return true;
        //         },
        //         success: function (data) {
        //             if (data && data.file_path) {
        //                 editor.focus();
        //                 data.file_path.forEach(function (src) {
        //                     editor.selection.setContent(dom.createHTML('img', {src: src}));
        //                 })
        //             }
        //         }
        //     });
        // });
        // 
        alert(1);

        input_f.click();
    }

    editor.addCommand("mceUploadImageEditor", selectLocalImages);

    editor.addButton('uploadrecipe', {
        icon: 'image',
        tooltip: '上传图片',
        onclick: selectLocalImages
    });

    editor.addMenuItem('uploadrecipe', {
        icon: 'image',
        text: '上传图片',
        context: 'tools',
        onclick: selectLocalImages
    });
});