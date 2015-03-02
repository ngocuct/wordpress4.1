/** 
 * We developed this code with our hearts and passion.
 * @package wp-media-folder
 * @copyright Copyright (C) 2014 JoomUnited (http://www.joomunited.com). All rights reserved.
 * @license GNU General Public License version 2 or later; http://www.gnu.org/licenses/gpl-2.0.html
 */
var initOwnFilter, relCategoryFilter = {}, relFilterCategory = {}, currentCategory=0, usedAttachmentsBrowser=null, page=null;
(function($){
    
   // ---------  folder tree -------------------------------- 
    var options = {
        'root': '/',
        'showroot': 'Media Folder',
        'onclick': function (elem, type, file) {},
        'oncheck': function (elem, checked, type, file) {},
        'usecheckboxes': true, //can be true files dirs or false
        'expandSpeed': 500,
        'collapseSpeed': 500,
        'expandEasing': null,
        'collapseEasing': null,
        'canselect': true
    };

    var methods = {
        init: function (o) {
            if ($(this).length == 0) {
                return;
            }
            $this = $(this);
            $.extend(options, o);

            if (options.showroot != '') {
                $this.html('<ul class="jaofiletree"><li class="drive directory collapsed selected"><a href="#" data-id="0" data-file="' + options.root + '" data-type="dir">' + options.showroot + '</a></li></ul>');
            }
            openfolder(options.root);
        },
        open: function (dir) {
            openfolder(dir);
        },
        close: function (dir) {
            closedir(dir);
        },
        getchecked: function () {
            var list = new Array();
            var ik = 0;
            $this.find('input:checked + a').each(function () {
                list[ik] = {
                    type: $(this).attr('data-type'),
                    file: $(this).attr('data-file')
                }
                ik++;
            });
            return list;
        },
        getselected: function () {
            var list = new Array();
            var ik = 0;
            $this.find('li.selected > a').each(function () {
                list[ik] = {
                    type: $(this).attr('data-type'),
                    file: $(this).attr('data-file')
                }
                ik++;
            });
            return list;
        }
    };
    // ---------end  folder tree -------------------------------- 
    
    $(document).ready(function(){
        //folder tree
             openfolder = function (dir) {
            var id = $('.jaofiletree li.selected a').data('id');            
            if ($this.find('a[data-file="' + dir + '"]').parent().hasClass('expanded')) {
                return;
            }
            var ret;
            ret = $.ajax({
                url: ajaxurl,
                data: {dir: dir, id: id,action: 'get_terms'},
                context: $this,
                dataType: 'json',
                beforeSend: function () {
                    this.find('a[data-file="' + dir + '"]').parent().addClass('wait');
                }
            }).done(function (datas) {
                ret = '<ul class="jaofiletree" style="display: none">';
                for (ij = 0; ij < datas.length; ij++) {
                    //if (datas[ij].file != 'Uncategorized' && datas[ij].file != 'No Categories') {
                        if (datas[ij].type == 'dir') {
                            classe = 'directory collapsed';
                        } else {
                            classe = 'file ext_' + datas[ij].ext;
                        }
                        ret += '<li class="' + classe + '" data-id="' + datas[ij].id + '" data-parent_id="' + datas[ij].parent_id + '">';
                        ret += '<div class="icon-open-close" data-id="' + datas[ij].id + '" data-parent_id="' + datas[ij].parent_id + '" data-file="' + dir + datas[ij].file + '/" data-type="' + datas[ij].type + '"></div>';
                        ret += '<a href="#" class="title-folder" data-id="' + datas[ij].id + '" data-parent_id="' + datas[ij].parent_id + '" data-file="' + dir + datas[ij].file + '/" data-type="' + datas[ij].type + '">' + datas[ij].file + '</a>';
                        ret += '</li>';
                    //}
                }
                ret += '</ul>';

                this.find('a[data-file="' + dir + '"]').parent().removeClass('wait').removeClass('collapsed').addClass('expanded');
                this.find('a[data-file="' + dir + '"]').after(ret);
                this.find('a[data-file="' + dir + '"]').next().slideDown(options.expandSpeed, options.expandEasing);
                setevents();

            }).done(function () {
                //Trigger custom event
                $this.trigger('afteropen');
                $this.trigger('afterupdate');
            });
            
        }

        closedir = function (dir) {
            $this.find('a[data-file="' + dir + '"]').next().slideUp(options.collapseSpeed, options.collapseEasing, function () {
                $(this).remove();
            });
            $this.find('a[data-file="' + dir + '"]').parent().removeClass('expanded').addClass('collapsed');
            setevents();

            //Trigger custom event
            $this.trigger('afterclose');
            $this.trigger('afterupdate');

        }

        setevents = function () {
            $this.find('li a,li .icon-open-close').unbind('click');
            //Bind userdefined function on click an element
            $this.find('li a,li.collapsed .icon-open-close').bind('click', function () {
                options.onclick(this, $(this).attr('data-type'), $(this).attr('data-file'));
                if (options.canselect) {
                    $this.find('li').removeClass('selected');
                    $(this).parent().addClass('selected');
                }
                return false;
            });
           
            //Bind for collapse or expand elements
            $this.find('li.directory a').bind('click', function () {
                var id = $('.jaofiletree li.selected a').data('id');
                $('.wpmf-categories [data-id="' + id + '"]').prop('selected', 'selected').change();
                methods.open($(this).attr('data-file'));
                return false;
            });
            
            $this.find('li.directory.collapsed .icon-open-close').bind('click', function () {
                var id = $('.jaofiletree li.selected a').data('id');
                $('.wpmf-categories [data-id="' + id + '"]').prop('selected', 'selected').change();
                methods.open($(this).attr('data-file'));
                return false;
            });
            
            $this.find('li.directory.expanded .icon-open-close').bind('click', function () {
                methods.close($(this).attr('data-file'));
                return false;
            });
            
        }
 
        $.fn.jaofiletree = function (method) {
            // Method calling logic
            if (methods[method]) {
                return methods[ method ].apply(this, Array.prototype.slice.call(arguments, 1));
            } else if (typeof method === 'object' || !method) {
                return methods.init.apply(this, arguments);
            } else {
                //error
            }
        };

// --------- end folder tree --------------------------------
        
        addFolder = function(){
            if( $('#addFolder').length === 0 ) {                
                if(page!=='table'){
                    btnNewFolder = $('<div id="addFolder" class="media-toolbar-third" style="float: left;"><input type="button" placeholder="Recherche" class="button button-primary button-large" value="Create folder" style="margin-top: 10px;"></div>');
                    $('.media-frame-content .media-toolbar-secondary').after(btnNewFolder);
                }else{
                    btnNewFolder = $('<div id="addFolder" style="display: inline-block;"><input type="button" placeholder="Recherche" class="button button-primary button-large" value="Create folder" style="margin-top: -4px;"></div>');
                    $('.wp-filter .actions').after(btnNewFolder);
                }
                
                btnNewFolder.click(function(){
                    name = prompt("Please give a name to this new folder","New folder");
                    if(name!=='' && name != 'null'){
                        $.ajax({
                            type : "POST",
                            url : ajaxurl,
                            data :  {
                                action : "add_folder",
                                name   : name,
                                parent : $('select.wpmf-categories option:selected').data('id') | 0
                            },
                            success : function(response){
                                if(typeof(response.term_id)!=='undefined'){
                                    //insert the new element
                                    categoriesCount = $('select.wpmf-categories option').length-1;
                                    relCategoryFilter[response.term_id] = String(categoriesCount+1);
                                    relFilterCategory[categoriesCount+1] = response.term_id;
                                    if(page!=='table'){
                                        $('select.wpmf-categories option:selected').after('<option value="'+(categoriesCount+1)+'" data-id="'+response.term_id+'" data-parent_id="'+response.parent+'">'+response.name+'</option>');
                                    }else{
                                        $('select.wpmf-categories option:selected').after('<option class="level-'+response.level+'" value="'+response.term_id+'" data-id="'+response.term_id+'" data-parent_id="'+response.parent+'">'+response.name+'</option>');
                                    }
                                    $('.wpmf-attachments-browser').append('<li class="wpmf-attachment" data-id="'+response.term_id+'">'+
                                                        '<div class="wpmf-attachment-preview">'+
                                                            '<img src="'+wpmf_images_path+'/xxx-folder.png" class="icon" draggable="false">'+
                                                            '<div class="filename">'+
                                                                    '<div>'+response.name+'</div>'+
                                                            '</div>'+
                                                            '<span class="icon-edit"><a href="#"><img src="'+wpmf_images_path+'/edit.png"/></a></span>'+
                                                            '<span class="icon-delete"><a href="#"><img src="'+wpmf_images_path+'/delete.png"/></a></span>'+
                                                         '</div>'+
                                                        '</li>'
                                    );
                            
                                    //folder tree
                                    var dir_parent = $('li.directory.selected a').data('file');
                                    var dir = dir_parent + response.name + '/';
                                    //ret = '<ul class="jaofiletree" style="display: none">';
                                            var ret = '<li class="directory collapsed" data-id="' + response.term_id + '" data-parent_id="' + response.parent + '">'
                                            ret += '<div class="icon-open-close" data-id="' + response.term_id + '" data-parent_id="' + response.parent + '" data-file="'+ dir +'" data-type="dir"></div>';
                                            ret += '<a href="#" data-id="' + response.term_id + '" data-parent_id="' + response.parent + '" data-file="'+ dir +'" data-type="dir">' + response.name + '</a>';
                                            ret += '</li>';
                                        //}
                                    //ret += '</ul>';							
                                    $('#jao').find('li[data-id="' + response.parent + '"]').append(ret);
									
                                   // $('#jao').find('li[data-parent_id="' + response.parent + '"]').parent().append(ret);
                                    setevents();
                                    
                                    //Add element to the select list
                                    wpmf_categories[response.term_id] = {id:response.term_id , label:response.name , parent_id : response.parent, slug : response.slug};
                                    if(page!=='table'){
                                        initOwnFilter();
                                        $('select.wpmf-categories option[data-id="'+currentCategory+'"]').prop('selected','selected');
                                    }
                                    
                                    initDraggable();
                                    initDroppable();
                                    
                                    //refresh
                                    bindAttachmentEvent();
                                }else{
                                    alert(response);
                                }                      
                            }
                        });
                    }
                });
            }
        };
                
        initSelectFilter = function(){
            if(page!=='table'){
                //set the id for each option
                $('select.wpmf-categories option').each(function(){
                    if($(this).val()!== 0 && typeof(relFilterCategory[$(this).val()])!=='undefined' && typeof(wpmf_categories[relFilterCategory[$(this).val()]])!=='undefined'){
                        $(this).attr('data-id',wpmf_categories[relFilterCategory[$(this).val()]].id);
                        $(this).attr('data-parent_id',wpmf_categories[relFilterCategory[$(this).val()]].parent_id);
                    }
                });
                //bind the change event on select
                $('select.wpmf-categories').bind('change',function(){
                    var id = $(this).find('option:selected').data('id');
                    changeCategory.call(this);
                    $('li.directory').removeClass('selected');
                    $('li.directory[data-id="'+ id +'"]').addClass('selected');
                });

                if($('ul.attachments').length){
                    $('ul.attachments').get(0).addEventListener("DOMNodeInserted", function(){
                        $('ul.attachments').trigger('change');
                    });
                }
            }else{
                //set the id for each option
                $('select.wpmf-categories option').each(function(){
                    if($(this).val()!== 0 && typeof(wpmf_categories[$(this).val()])!=='undefined'){
                        $(this).attr('data-id',wpmf_categories[$(this).val()].id);
                        $(this).attr('data-parent_id',wpmf_categories[$(this).val()].parent_id);
                    }
                });
                $('select.wpmf-categories').change(function(){
                    $('select.wpmf-categories').parents('form').submit();
                });
            }
        };
               
        initDraggable = function(){
            $('.wpmf-attachments-browser .wpmf-attachment:not(.wpmf-attachment-back )').draggable({                         
                revert: true
            });
        };
        
        initDroppable = function(){
            $('.wpmf-attachments-browser .wpmf-attachment').droppable({
                hoverClass: "ui-hoverClass",
                drop: function( event, ui ) {
                    if($(ui.draggable).hasClass('wpmf-attachment')){
                        //case folder dropped on folder
                        id_category = $(this).data('id');
                        id = $(ui.draggable[0]).data('id');
                        var name = $(ui.draggable[0]).find('.filename div').html();
                        currentCategory = $('select.wpmf-categories option:selected').attr('data-id');
                        $.ajax({
                            type : "POST",
                            url : ajaxurl,
                            data :  {
                                action : "move_folder",
                                id      : id,
                                name: name,
                                id_category : id_category
                            },
                            success : function(response){
                                if(response===true){
                                    //update categories array
                                    wpmf_categories[id].parent_id = id_category;
                                    wpmf_categories[id].depth = wpmf_categories[id_category].depth+1;

                                    incrDepth = function(parent){
                                        wpmf_categories.each(function(index,value){
                                            if(wpmf_categories[index].parent_id==parent){
                                                wpmf_categories[index].depth ++;
                                                incrDepth(wpmf_categories[index]);
                                            }
                                        });
                                    };
                                    
                                    var dir_parent = $('li.directory a[data-id="'+ id_category +'"]').data('file');
                                    var dir = dir_parent + name + '/';
                                    $('.directory[data-id="' + id + '"]').remove();
                                    var ret = '<li class="directory collapsed" data-id="' + id + '" data-parent_id="' + wpmf_categories[id].parent_id + '">';
                                        ret += '<div class="icon-open-close" data-id="' + id + '" data-parent_id="' + wpmf_categories[id].parent_id + '" data-file="'+ dir +'" data-type="dir"></div>';
                                        ret += '<a href="#" data-id="' + id + '" data-parent_id="' + wpmf_categories[id].parent_id + '" data-file="'+ dir +'" data-type="dir">' + wpmf_categories[id].label + '</a>';
                                        ret += '</li>';
                                    $('#jao').find('li[data-parent_id="' + wpmf_categories[id].parent_id + '"]').parent().append(ret);
                                    setevents();
                                    
                                    //move item in the option list
                                    if(page!=='table'){
                                        item = $('.wpmf-categories option[value="'+relCategoryFilter[id]+'"]').remove();
                                        afterItem = $('.wpmf-categories option[value="'+relCategoryFilter[id_category]+'"]');
                                    }else{
                                        item = $('.wpmf-categories option[value="'+id+'"]').remove();
                                        afterItem = $('.wpmf-categories option[value="'+id_category+'"]');
                                    }
                                    currentDepth = wpmf_categories[afterItem.data('id')].depth
                                    while(afterItem.next().lenght > 0 && wpmf_categories[afterItem.next().data('id')].depth !== currentDepth){
                                        afterItem = afterItem.next();
                                    }
                                    afterItem.after(item);

                                    //remove item in the attachment list
                                    $('.wpmf-attachment[data-id="'+id+'"]').remove();
                                    initOwnFilter();

                                    //reselect current category
                                    $('select.wpmf-categories option').prop('selected',null);
                                    $('select.wpmf-categories option[data-id="'+currentCategory+'"]').prop('selected','selected');
                                }else{
                                    alert('A term with the name and slug already exists with this parent.');
                                }
                            }
                        });
                    }else{
                        //case file drop
                        id_category = $(this).data('id');

                        var elementsIds = ui.helper.data('wpmfElementsIds');
                        id_attachment = $(ui.draggable[0]).data('id');
                        $.ajax({
                            type : "POST",
                            url : ajaxurl,
                            data :  {
                                action : "move_file",
                                ids      : elementsIds,
                                id_category : id_category
                            },
                            success : function(response){
                                if(response==true){
                                    if(page!=='table'){
                                        if(wp.media.frame.content.get()!==null){
                                            wp.media.frame.content.get().collection.props.set({ignore: (+ new Date())});
                                            wp.media.frame.content.get().options.selection.reset();
                                        }else{
                                            wp.media.frame.library.props.set({ignore: (+ new Date())});
                                        }
                                    }else{
                                        $(elementsIds.split(',')).each(function(){
                                            $('#the-list #post-'+this).hide();
                                        });
                                    }
                                }
                            }
                        });
                    }
                }
            });
        };
        
        changeCategory = function(){
            //unselect items
            if(typeof(wp.media)!=='undefined' && typeof(wp.media.frame)!=='undefined' && wp.media.frame.content.get()!==null){
                wp.media.frame.content.get().options.selection.reset();
            }
            $('.wpmf-attachments-browser').html(null);
            selectedId = $(this).find('option:selected').data('id') || 0;
            selectedParentId = $(this).find('option:selected').data('parent_id') || 0;

            //save the current folder 
            $.ajax({
                type : "POST",
                url : ajaxurl,
                data :  {
                    action : "change_folder",
                    id   : selectedId
                }
            });

            //folder tree
            var menu_left = '<div id="jao" style="margin-top:10px"></div>';
            if ($('#jao').length === 0) {
                $('.wpmf-attachments-browser').before(menu_left);
                $('#jao').jaofiletree({
                    onclick: function (elem, type, file) {}
                });
                $('#jao').bind('afteropen', function () {
                    jQuery('#debugcontent').prepend('A folder has been opened<br/>');
                });
                $('#jao').bind('afterclose', function () {
                    jQuery('#debugcontent').prepend('A folder has been closed<br/>');
                });
            }
            
            if(selectedId!==0){
                $('.wpmf-attachments-browser').append('<li class="wpmf-attachment wpmf-attachment-back" data-id="'+selectedParentId+'">'+
                                  '<div class="wpmf-attachment-preview">'+
                                                '<img src="'+wpmf_images_path+'/back.png" class="icon" draggable="false">'+
                                                '<div class="filename">'+
                                                        '<div>Back</div>'+
                                                '</div>'+
                                             '</div>'+
                                            '</li>'
                );
            }
            $.each(wpmf_categories,function(){
                if(this.parent_id==selectedId && this.slug!==''){                        
                    $('.wpmf-attachments-browser').append('<li class="wpmf-attachment" data-parent_id="'+ this.parent_id +'" data-id="'+this.id+'">'+
                            '<div class="wpmf-attachment-preview">'+
                                                    '<img src="'+wpmf_images_path+'/xxx-folder.png" class="icon" draggable="false">'+
                                                    '<div class="filename">'+
                                                            '<div>'+this.label+'</div>'+
                                                    '</div>'+
                                                    '<span class="icon-edit"><a href="#"><img src="'+wpmf_images_path+'/edit.png"/></a></span>'+
                                                    '<span class="icon-delete"><a href="#"><img src="'+wpmf_images_path+'/delete.png"/></a></span>'+
                                                 '</div>'+
                                                '</li>'
                    );
                }
            });

            if(page!=='table'){
                currentCategory = relFilterCategory[$(this).val()];
            }else{
                currentCategory = $(this).val();
            }

            //alter breadcrumb
            $('.wpmf-breadcrumb').html(null);   
            bcat = wpmf_categories[currentCategory];
            breadcrumb = '';
            while(bcat.parent_id != 0){
                breadcrumb = '<li>&nbsp;&nbsp;/&nbsp;&nbsp;<a href="#" data-id="'+wpmf_categories[bcat.id].id+'">'+wpmf_categories[bcat.id].label+'</a></li>' + breadcrumb;
                bcat = wpmf_categories[wpmf_categories[bcat.id].parent_id];
            }
            if(bcat.id!=0){
                breadcrumb = '<li><a href="#" data-id="'+wpmf_categories[bcat.id].id+'">'+wpmf_categories[bcat.id].label+'</a></li>' + breadcrumb;
            }
            breadcrumb = '<li>You are here&nbsp;&nbsp;:<a href="#" data-id="0">&nbsp;&nbsp;Home&nbsp;&nbsp;</a>/&nbsp;&nbsp;</li>' + breadcrumb; 
            $('.wpmf-breadcrumb').prepend(breadcrumb);
            $('.wpmf-breadcrumb a').click(function(){
                $('.wpmf-categories [data-id="'+wpmf_categories[$(this).data('id')].id+'"]').prop('selected','selected').change();
                $('.wpmf-categories').trigger('change');
            });

            //initialise drag and drop
            initDroppable();

            initDraggable();

            if(page!=='table'){
                $('ul.attachments').unbind('change').bind('change',function(){
                    $('ul.attachments .attachment').draggable({ 
                        revert: true,
                        helper: function (e) {
                            var elementsIds = [];
                            var elements = $.merge($(this),$('.wpmf-attachments-wrapper .attachments .attachment.selected').not(this));

                            //attach selected elements data-id to the helper
                            elements.each(function(){
                                elementsIds.push($(this).data('id'));
                            });
                            helper = $(this).clone();
                            helper.append('<span class="draggableNumber">'+elements.length+'</<span>');
                            helper.data('wpmfElementsIds',elementsIds.join());
                            return helper;
                        },
                        appendTo: ".wpmf-attachments-wrapper",
                        start: function(event, ui) {
                            var elementsIds = ui.helper.data('wpmfElementsIds').split(',');
                            $(elementsIds).each(function(index,value){
                                $('.wpmf-attachments-wrapper .attachments .attachment[data-id="'+value+'"]').css('visibility','hidden');
                            });
                        },
                        stop: function(event, ui) {
                            var elementsIds = ui.helper.data('wpmfElementsIds').split(',');
                            $(elementsIds).each(function(index,value){
                                $('.wpmf-attachments-wrapper .attachments .attachment[data-id="'+value+'"]').css('visibility','visible');
                            });
                        }
                    });
                });
            }else{
                $('input[name="media[]"]').change(function(){
                    if($(this).is(':checked')){
                        $(this).parents('tr').find('.wpmf-move').addClass('selected');
                    }else{
                        $(this).parents('tr').find('.wpmf-move').removeClass('selected');
                    }
                });
                
                $('.wpmf-move').draggable({ 
                    revert: true,
                    helper: function (e) {
                        var elementsIds = [];
                        var elements = $.merge($(this).parents('tr').find('input[name="media[]"]'),$('#the-list input[name="media[]"]:checked').not($(this).parents('tr').find('input[name="media[]"]')));

                        //attach selected elements data-id to the helper
                        elements.each(function(){
                            elementsIds.push($(this).val());
                        });
                        helper = $(this).clone();
                        helper.append('<span class="draggableNumber">'+elements.length+'</<span>');
                        helper.data('wpmfElementsIds',elementsIds.join());
                        return helper;
                    },
                    appendTo: ".wpmf-attachments-wrapper",
                    start: function(event, ui) {
                        var elementsIds = ui.helper.data('wpmfElementsIds').split(',');
                        $(elementsIds).each(function(index,value){
                            $('#post-'+value+'').css('opacity','0.2');
                        });
                    },
                    stop: function(event, ui) {
                        var elementsIds = ui.helper.data('wpmfElementsIds').split(',');
                        $(elementsIds).each(function(index,value){
                            $('#post-'+value+'').css('opacity','1');
                        });
                    }
                });
            }
            bindAttachmentEvent();
        };
            
        //bind the click event on folders
        bindAttachmentEvent = function(){
            $('.wpmf-attachment').unbind('click').bind('click',function(e){
                if($(e.target).hasClass('ui-draggable-dragging') || $(e.target).parents('.wpmf-attachment').hasClass('ui-draggable-dragging')){
                    return;
                }
                var id = $(this).data('id');

                //change the current category            
                if(id==0){
                    $('.wpmf-categories [value="0"]').prop('selected','selected').change();
                }else{
                    $('.wpmf-categories [data-id="'+id+'"]').prop('selected','selected').change();
                }
                
                $('li.directory.collapsed[data-id="'+ id +'"] a').click();
                
            });

            //click on edit button
            $('.wpmf-attachment .icon-edit a').unbind('click').bind('click',function(e){
                e.preventDefault();
                e.stopPropagation();
                name = prompt("Please give a name to this new folder",$(e.target).parents('span').siblings('.filename').find('div').html());
             
                if(name!=='' && name != 'null'){
                    id = $(e.target).parents('li.wpmf-attachment').data('id');
                    parent_id = $(e.target).parents('li.wpmf-attachment').data('parent_id');
                    
                    $.ajax({
                        type : "POST",
                        url : ajaxurl,
                        data :  {
                            action : "edit_folder",
                            name   : name,
                            id      : id,
                            parent_id: parent_id,
                        },
                        success : function(response){
                            if(response == false){
                                if(name != wpmf_categories[id].label){
                                    alert('A term with the name and slug already exists with this parent.');
                                }
                            }else{
                                if(typeof(response.term_id)!=='undefined'){
                                    $('select.wpmf-categories option[value="'+relCategoryFilter[id]+'"]').html(response.name);
                                    $(e.target).parents('span').siblings('.filename').find('div').html(response.name);
                                    wpmf_categories[id].label = response.name;
                                }   
                                
                                $('.directory[data-id="' + id + '"] a[data-id="' + id + '"]').html(name);
                            }
                        }
                    });
                }
            });

            //click on delete button
            $('.wpmf-attachment .icon-delete a').unbind('click').bind('click',function(e){
                e.preventDefault();
                e.stopPropagation();
                if(confirm("Are you sure to want to delete this folder")){
                    id = $(e.target).parents('li.wpmf-attachment').data('id');
                    $.ajax({
                        type : "POST",
                        url : ajaxurl,
                        data :  {
                            action : "delete_folder",
                            id      : id
                        },
                        success : function(response){
                            if(response==true){
                                $('select.wpmf-categories option[value="'+relCategoryFilter[id]+'"]').remove();
                                $('.wpmf-attachment[data-id="'+id+'"]').remove();
                                 $('.directory[data-id="' + id + '"]').remove();
                                 
                                delete(wpmf_categories[id]);
                            }else if(response == "not empty"){
                                alert('this folder contains sub-folder, delete sub-folders before');
                            }
                        }
                    });
                }
            });
        };
        
        if ( wp.media && $('body.upload-php table.media').length===0 ) {
            initOwnFilter = function(){
                wp.media.view.AttachmentFilters['wpmf_categories'] = wp.media.view.AttachmentFilters.extend({
                    className: 'wpmf-categories',

                    createFilters: function() {
                        var filters = {};
                        var ij=0;
                        space = '&nbsp;&nbsp;'; 
                        //_.each( wpmf_categories || {}, function( term ) {
                        _.each( wpmf_categories_order || [], function( key ) {
                         term =  wpmf_categories[key];                        
                            var query = {};                            
                            query['wpmf-category'] = {
                                taxonomy: 'wpmf-category',
                                term_id: parseInt( term.id, 10 ),
                                term_slug: term.slug
                            };

                            filters[ ij ] = {
                                text: space.repeat(term.depth)+term.label,
                                props: query
                            };                                        
                            relCategoryFilter[term.id] = ij;
                            relFilterCategory[ij] = term.id;
                            ij++;
                        });
                        this.filters = filters;
                    }
                });

                /**
                * Replace the media-toolbar with our own
                */
               var myDrop = wp.media.view.AttachmentsBrowser;

               wp.media.view.AttachmentsBrowser = wp.media.view.AttachmentsBrowser.extend({
                       createToolbar: function() {
                           wp.media.model.Query.defaultArgs.filterSource = 'filter-attachment-category';

                           myDrop.prototype.createToolbar.apply(this,arguments);
                           //Save the attachments because we'll need it to change the category filter
                           usedAttachmentsBrowser = this;
                           this.toolbar.set( 'wpmf-category', new wp.media.view.AttachmentFilters['wpmf_categories']({
                                   controller: this.controller,
                                   model:      this.collection.props,
                                   priority:   -80
                               }).render()
                           );
                       }
               });

               if(usedAttachmentsBrowser!==null){
                    usedAttachmentsBrowser.toolbar.set( 'wpmf-category', new wp.media.view.AttachmentFilters['wpmf_categories']({
                                            controller: usedAttachmentsBrowser.controller,
                                            model:      usedAttachmentsBrowser.collection.props,
                                            priority:   -80
                                            }).render()
                                    );
                    initSelectFilter();
                }
            };
            initOwnFilter();
        
            wp.media.view.Attachments.prototype.on('ready',function(){
                //add folder creation button if not exists
                addFolder();

                if($('.wpmf-attachments-wrapper').length===0){
                    $('.wpmf-attachments-browser, .wpmf-breadcrumb').remove();
                    //add the folders
                    $('ul.attachments').before('<div class="wpmf-attachments-browser"></div><div class="wpmf-clear"></div>');
                    
                    //wrapall 
                    $('.attachments-browser ul.attachments,.wpmf-breadcrumb, .attachments-browser .wpmf-attachments-browser,.wpmf-clear').wrapAll('<div class="wpmf-attachments-wrapper"></div>');

                    //add the breadcrumb
                    $('.wpmf-attachments-wrapper').prepend('<ul class="wpmf-breadcrumb"><li><a href="#" data-id="0">Files</a></li></ul>');

                    initSelectFilter();

                    //trigger the first selection
                    $('.wpmf-categories option').prop('selected',null);
                    $('.wpmf-categories option[value="'+relCategoryFilter[currentCategory]+'"]').prop('selected','selected');
                    $('.wpmf-categories').change();
                }
            });
            
            //see http://stackoverflow.com/questions/14279786/how-to-run-some-code-as-soon-as-new-image-gets-uploaded-in-wordpress-3-5-uploade
            if (typeof wp.Uploader !== 'undefined' && typeof wp.Uploader.queue !== 'undefined') {
                wp.Uploader.queue.on('reset', function() { 
                    wp.media.frame.content.get('gallery').collection.props.set({ignore: (+ new Date())});
                    $('select.wpmf-categories option[data-id="'+currentCategory+'"]').prop('selected','selected');
                });
            }
            wp.Uploader.queue.on('add', function() { 
                //change the current folder
                selectedId = $('.wpmf-categories option:selected').data('id') || 0;

                //save the current folder 
                $.ajax({
                    type : "POST",
                    url : ajaxurl,
                    data :  {
                        action : "change_folder",
                        id   : selectedId
                    }
                });
            });
            
        }else{
            //table mode
            page = 'table';
            var ij = 0;
            $.each( wpmf_categories || {}, function() {
                relCategoryFilter[this.id] = ij;
                relFilterCategory[ij] = this.id;
                ij++;
            });
            
            if($('.wpmf-attachments-wrapper').length===0){
                $('.wpmf-attachments-browser, .wpmf-breadcrumb').remove();
                //add the folders
                $('.wp-list-table.media').before('<div class="wpmf-attachments-browser"></div><div class="wpmf-clear"></div>');

                //wrapall 
                $('.wpmf-breadcrumb, .wpmf-attachments-browser,.wpmf-clear').wrapAll('<div class="wpmf-attachments-wrapper"></div>');
                
                //add the breadcrumb
                $('.wpmf-attachments-wrapper').prepend('<ul class="wpmf-breadcrumb"><li><a href="#" data-id="0">Files</a></li></ul>');
            }
            
            //Add the drag column on table
            $('.wp-list-table.media thead tr').prepend('<th class="wpmf-move-header"></th>');
            $('.wp-list-table.media #the-list tr').prepend('<td class="wpmf-move" title="Drag and Drop me hover a folder"><span class="icon-Drag_and_Drop"></span></td>');
            
            initSelectFilter();
            addFolder();
            changeCategory.call($('select.wpmf-categories'));
        }
    });
    //http://stackoverflow.com/questions/202605/repeat-string-javascript
    String.prototype.repeat = function(num) {
        return new Array(isNaN(num)? 1 : ++num).join(this);
    }
}(jQuery));