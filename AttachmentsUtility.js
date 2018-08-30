(function (window, document) {
    'use strict';
    var SPUtility = window.SPUtility || (window.SPUtility = {});

    function HandleFileUploadFunctionality(myFiles, browseButtonID, fileUploadControolID, showAttachmentULcntrlID, fileKey) {
        var Util = {
            //uitlity function to handle add remove file uploading
            allfiles: myFiles,
            AryInvalidFileEndings: [".files ", "_files -Dateien ", "_fichiers ", "_bestanden ", "_file ", "_archivos -filer ", "_tiedostot ", "_pliki ", "_soubory ", "_elemei ", "_ficheiros ", "_arquivos ", "_dosyalar ", "_datoteke ", "_fitxers ", "_failid ", "_fails ", "_bylos ", "_fajlovi ", "_fitxategiak"],
            aryInvalidCharacters: ['~', '#', '%', '&', '*', '{', '}', '\\', ':', '<', '>', '?', '/', '+', '|', '"'],
            totalFilesSize: 10,
            ValidateFileSize: function (files) {
                var totalSize = 0;
                for (var i in files) {
                    totalSize = files[i].size / (1024 * 1024);
                }
                return totalSize < this.totalFilesSize;
            },
            validateUploadedFile: function (file) {
                var isFileValid = false;
                var curFileName = file.name;
                var aryFileValidationMsgs = [];
                if (curFileName.length > 128) {
                    aryFileValidationMsgs[aryFileValidationMsgs.length] = "File name should not be greater than 128 characters.";
                }
                if (curFileName.split('.').length > 2) {
                    aryFileValidationMsgs[aryFileValidationMsgs.length] = "File name should not contain extra periodic characters.";
                }


                 if (/^[a-zA-Z0-9-._ ]*$/.test(curFileName) == false) {
                    aryFileValidationMsgs[aryFileValidationMsgs.length] = "File name should not contain special characters.";
                }
                var isInvalidFileendingExists = false;
                $.each(this.AryInvalidFileEndings, function (i, val) {
                    if (curFileName.indexOf(val) > -1) {
                        isInvalidFileendingExists = true;
                    }
                });
                if (isInvalidFileendingExists) {
                    aryFileValidationMsgs[aryFileValidationMsgs.length] = "File name should not contain special characters.";
                }
                if (aryFileValidationMsgs.length > 0) {
                    var ValidationMsg = "";
                    for (var i in aryFileValidationMsgs) {
                        ValidationMsg += aryFileValidationMsgs[i] + "   \n";
                    }
                    alert(ValidationMsg);
                } else {
                    isFileValid = true;
                }
                return isFileValid;
            },
            validateFileNameExists: function (file, ExistingFileNames) {
                var isValid = true;
                if (typeof (fileKey) != 'undefined') {
                    var curFileName = file.name;
                }
                return isValid;
            },
            applyDeleteButtontoExstingItems: (function () {
                var eleUl = $("#" + showAttachmentULcntrlID);
                if (eleUl.length == 1) {
                    //alert('element Ul Exists.');
                }
            })()
        }



        Util.handleFileControlChangeEvent = function (ele) {
            if (typeof (ele.files) != 'undefined') {
                var attachedfiles = ele.files;
                var ExistingFileNames = [];
                var eleUL = (showAttachmentULcntrlID || '') ? $("#" + showAttachmentULcntrlID) : $(ele).siblings('div.showAttachments').find('ul');
                if (eleUL.length == 1) {
                    eleUL.children('li').each(function () {
                        ExistingFileNames.push($(this).find('span').text().trim());
                    });
                    if (attachedfiles.length > 0) {
                        for (var i = 0; i < attachedfiles.length; i++) {
                            if ($.inArray(attachedfiles[i].name.trim(), ExistingFileNames) == -1) {
                                if (this.validateUploadedFile(attachedfiles[i])) {
                                    Util.allfiles.push(attachedfiles[i])
                                    if (this.ValidateFileSize(Util.allfiles)) {
                                        eleUL.append('<li><span> ' + attachedfiles[i].name + '</span></li>');
                                    } else {
                                        Util.allfiles = Util.allfiles.filter(function (el) {
                                            return el.name != attachedfiles[i].name;
                                        });
                                        alert("Total attachments size should not be greater than 10 MB.");
                                    }
                                }
                            } else {
                                alert(attachedfiles[i].name + ' file already exists in the uploaded documents.');
                            }
                        }
                    }
                    eleUL.children('li').each(function () {
                        if (!$(this).children('a').hasClass('deleteNewAttachment')) {
                            $(this).append(' <a class="deleteNewAttachment" style="color:red" href="#"><i class="fa fa-trash" aria-hidden="true"></i></a>');
                            $(this).find('.deleteNewAttachment').click(function (event) {
                                event.preventDefault();
                                var removedFileName = $(this).prev('span').text().trim();
                                $(this).parent('li').remove();
                                var index = -1;
                                $.each(Util.allfiles, function (i, v) {
                                    if (v.name == removedFileName)
                                        index = i;
                                });
                                if (index > -1)
                                    Util.allfiles.splice(index, 1);
                            });
                        }
                    });
                }
            }
            $(ele).val("");
        }
        Util.applyChangeFunctionality = function (BrowseButtonID, fileUploadControlID) {
            $('#' + BrowseButtonID).click(function (event) {
                event.preventDefault();
                event.stopPropagation();

                $('#' + fileUploadControlID).click();
            });
            $('#' + fileUploadControlID).change(function () {
                Util.handleFileControlChangeEvent(this);
            })
        }
        Util.applyChangeFunctionality(browseButtonID, fileUploadControolID);
    }
	    var clearFileUploadControl = function (fileCntrlID) {
        var $el = $('#' + fileCntrlID);
        if ($el && $el.length > 0) {
            $el.wrap('<form>').closest('form').get(0).reset();
            $el.unwrap();
        }
    }
	
	    var uploadItemAttachments = function (allFiles, ListName, ItemID, successMethod, fileKey) {
        var Def = $.Deferred();
        var fileCountCheck = 0;
        if (allFiles.length > 0) {
            loopthoughAllFilesAttached(allFiles, ListName, ItemID, fileCountCheck).then(function (data) {
                Def.resolve(data);
            }, function (err) {
                Def.reject(err);
            });
        } else {
            Def.resolve("Files are not attached to the item.");
        }

        function loopthoughAllFilesAttached(allFiles, ListName, ItemID, fileCountCheck) {
            var dfd = $.Deferred();
            uploadFile(ListName, ItemID, allFiles[fileCountCheck], allFiles[fileCountCheck].name).then(function (data) {
                fileCountCheck++;
                if (fileCountCheck <= allFiles.length - 1) {
                    loopthoughAllFilesAttached(allFiles, ListName, ItemID, fileCountCheck);
                } else {
                    console.log(fileCountCheck + ": files uploaded.");
                    successMethod();
                    dfd.resolve(data);
                }
            }, function (err) {
                dfd.reject(JSON.stringify(err));
            });
            return dfd.promise();
        }

        function uploadFile(listName, id, file, fileName) {
            var deferred = $.Deferred();
            var fileName = file.name;
            var isTextfile = file.type == 'text/plain' ? true : false;
            if (fileKey || '')
                fileName = fileKey + "-" + fileName;
            getFileBuffer(file).then(
                function (buffer) {
                    var bytes = new Uint8Array(buffer);
                    var binary = '';
                    for (var b = 0; b < bytes.length; b++) {
                        binary += String.fromCharCode(bytes[b]);
                    }
                    var scriptbase = _spPageContextInfo.webServerRelativeUrl + "/_layouts/15/";
                    $.getScript(scriptbase + "SP.RequestExecutor.js", function () {
                        var createitem = new SP.RequestExecutor(_spPageContextInfo.webServerRelativeUrl);
                        createitem.executeAsync({
                            url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + listName + "')/items(" + id + ")/AttachmentFiles/add(FileName='" + fileName + "')",
                            method: "POST",
                            binaryStringRequestBody: isTextfile ? false : true,
                            body: isTextfile ? buffer : binary,
                            success: fsucc,
                            error: ferr,
                            state: "Update"
                        });

                        function fsucc(data) {
                            deferred.resolve(data);
                        }

                        function ferr(error) {
                            deferred.reject(error);
                        }
                    });
                },
                function (err) {
                    deferred.reject(err);
                    console.log(err);
                });
            return deferred.promise();
        }

        function getFileBuffer(file) {
            var deferred = $.Deferred();
            var reader = new FileReader();
            reader.onloadend = function (e) {
                deferred.resolve(e.target.result);
            }
            reader.onerror = function (e) {
                deferred.reject(e.target.error);
            }
            var isTextfile = file.type == 'text/plain' ? true : false;
            (isTextfile) ? reader.readAsDataURL(file): reader.readAsArrayBuffer(file);
            return deferred.promise();
        }
        return Def.promise();
    }

    function loopthroughAllURLsToDelete(aryDeleteUrls, lstName, currentFileIndex, successMethod) {
        var dfd = $.Deferred();
        var deletedItemsLength = aryDeleteUrls.length;
        var v = aryDeleteUrls[currentFileIndex];
        v = v.ServerRelativeUrl;
        if (v.indexOf("/Attachments/") > -1)
            v = v.split("/Attachments/")[1];
        var aryAttach = v.split('/');
        var UrlDeleteItem = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + lstName + "')/GetItemById(" + aryAttach[0] + ")/AttachmentFiles/getByFileName('" + aryAttach[1] + "')";
        DeleteRequest(UrlDeleteItem).then(function (data) {
            currentFileIndex++;
            if (currentFileIndex == deletedItemsLength) {
                if (typeof successMethod == 'function')
                    successMethod();
                dfd.resolve();
            } else {
                loopthroughAllURLsToDelete(aryDeleteUrls, lstName, currentFileIndex, successMethod);
            }
        }, function (err) {
            currentFileIndex++;
            alert("failed to delete attachment with titel: \t " + aryAttach[1] + "\n " + err);
            dfd.reject();
        });
        return dfd.promise();
    }

    function DeleteRequest(RestUri) {
        var Dfd = $.Deferred();
        $.ajax({
            url: RestUri,
            type: 'DELETE',
            contentType: 'application/json;odata=verbose',
            headers: {
                'X-RequestDigest': $('#__REQUESTDIGEST').val(),
                'X-HTTP-Method': 'DELETE',
                'Accept': 'application/json;odata=verbose'
            },
            success: function (data) {
                Dfd.resolve(data);
            },
            error: function (error) {
                Dfd.reject(JSON.stringify(error));
            }
        });
        return Dfd.promise();
    }

    function handleDeleteExistingFilesClick(uLID, UploadedFiles, deletedFiles) {
        if (typeof (uLID) != 'undefined' && $('#' + uLID).length == 1) {
            var ulEle = $('#' + uLID);
            ulEle.children('li').each(function () {
                if (!$(this).children('a').hasClass('deleteNewAttachment')) {
                    $(this).append(' <a class="deleteNewAttachment" style="color:red" href="#"> <i class="fa fa-trash" aria-hidden="true"></i></a>');
                    $(this).find('.deleteNewAttachment').click(function (event) {
                        event.preventDefault();
                        var removedFileName = $(this).prev('span').text().trim();
                        $(this).parent('li').remove();
                        var index = -1;
                        $.each(UploadedFiles, function (i, v) {
                            if (v.FileName == removedFileName) {
                                index = i;
                                deletedFiles.push(v);
                            }
                        });
                        if (index > -1)
                            UploadedFiles.splice(index, 1);
                    });
                }
            });
        }
    }	
    function publishExternalAPI(SPUtility) {
        $.extend(SPUtility, {
            'clearFileUploadControl': clearFileUploadControl,
            'HandleFileUploadFunctionality': HandleFileUploadFunctionality,
            'uploadItemAttachments': uploadItemAttachments,
            'loopthroughAllURLsToDelete': loopthroughAllURLsToDelete,
            'handleDeleteExistingFilesClick': handleDeleteExistingFilesClick
        });
    }
    publishExternalAPI(SPUtility);
})(window, document);
