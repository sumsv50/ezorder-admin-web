// function replaceView(url) {
//     var template = Handlebars.compile($('#list-item-template').html());
//     $.getJSON (url, function(result) {

//         result.products.forEach(product => {
//             if(product.createdAt) {
//                 var date = new Date(product.createdAt);
//                 product.createdAt = date.toLocaleString();
//             }
//         });
//         var productHtml = template({products: result.products});
//         $('#items-list').html(productHtml);
//         totalPages = result.totalPages;
//         currentPage = result.currentPage;
//         hasPrevPage = result.hasPrevPage;
//         hasNextPage = result.hasNextPage;

//         paginationBtn(behavior, type, totalPages, currentPage, hasPrevPage, hasNextPage);
//         const newurl = url.replace('/api','');
//         history.pushState({}, 'Product Admin - Dashboard', newurl);
//     });
// }

var productId;
var categoryId;
var btnDeleteProductConfirm = document.getElementById('btnDeleteProduct');
var btnAddNewCategory = document.getElementById('btnAddNewCategory');
var deleteProductForm = document.forms['delete-product-form'];
var txtCategoryName = document.getElementById('nameCategory');
var txtCategoryName_retype = document.getElementById('nameCategory_retype');

var btnAddNewCategory = document.getElementById('btnAddNewCategory');
var btnSaveChange = document.getElementById('save-item-info');
var btnDeleteProduct = document.getElementById('btn-delete-product');
var loadingModal = document.getElementById('loading-modal');

//When dialog confirm show
$('#delete-product-modal').on('show.bs.modal', function (event) {
    var button = $(event.relatedTarget); // Button that triggered the modal
    const modal = $(this)
    modal.find('.modal-body').text(`Bạn có chắc muốn xóa "${currentData.name}"?`);
})
$('#editProductDialog').on('show.bs.modal', function (event) {
    button = $(event.relatedTarget); // Button that triggered the modal
    
    const productId = button.data('id');
    button = button.get(0);
    $.getJSON (`api/products/${productId}`, function(result) {
        
        var productHtml = templateModal({product: result});
        currentData = result;
        document.querySelector("#editProductDialog .modal-body").innerHTML = productHtml;
        btnSaveChange.setAttribute('data-item-id',productId)
        //btnDeleteProduct.setAttribute('data')
        var i = 0;
        imgs = [];
        result.img.forEach(img => {
            imgs.push({index: i++, src: img});
        });
        updateImg();

    })
})



$('#addProductDialog').on('show.bs.modal', function (event) {
    //button = $(event.relatedTarget); // Button that triggered the modal
    
    //const productId = button.data('id');
    //button = button.get(0);
        
        var productHtml = templateModal({});
        document.querySelector("#addProductDialog .modal-body").innerHTML = productHtml;
        imgs = [];
        updateImg();

})
//Listening
btnDeleteProductConfirm.onclick = function () {
    deleteProductForm.action = '/products/' + currentData._id + '?_method=DELETE';
    deleteProductForm.submit();
}



// When type input
txtCategoryName.addEventListener('input', (event) => {
    if (txtCategoryName.value == '') {
        txtCategoryName.classList.add("is-invalid");
        } else {
            txtCategoryName.classList.remove("is-invalid");
        }

        if (txtCategoryName_retype.value == txtCategoryName.value) {
            txtCategoryName_retype.classList.remove("is-invalid");
        } else {
            txtCategoryName_retype.classList.add("is-invalid");
        }

        //Button
        if (txtCategoryName.value != '' && txtCategoryName_retype.value == txtCategoryName.value) {
            btnAddNewCategory.disabled = false;
        } else {
            btnAddNewCategory.disabled = true;
        }
    });

    txtCategoryName_retype.addEventListener('input', (event) => {
        if (txtCategoryName_retype.value == txtCategoryName.value) {
            txtCategoryName_retype.classList.remove("is-invalid");
        } else {
            txtCategoryName_retype.classList.add("is-invalid");
        }

        //Button
        if (txtCategoryName.value != '' && txtCategoryName_retype.value == txtCategoryName.value) {
            btnAddNewCategory.disabled = false;
        } else {
            btnAddNewCategory.disabled = true;
        }
    });





   
   

    btnSaveChange.onclick = function() {
        loadingModal.removeAttribute('hidden');
        const form = document.querySelector('#itemInfo');
        
        var formData = new FormData(form);

        const data = Object.fromEntries(new FormData(form).entries());
        const productId = btnSaveChange.getAttribute('data-item-id');
        if (data.name==currentData.name) {
            formData.delete('name');
            newName = '';
        } else {
            newName = data.name;
        }
        if (data.type==currentData.type) {
            formData.delete('type');
        }
        if (data.price==currentData.price) {
            formData.delete('price');
            newPrice = '';
        } else {
            newPrice = data.price;
        }
        
        var isAvailable = data.available == 'true' ? true: false;
        if (isAvailable==currentData.available) {
            formData.delete('available');
            changeAvailable = false;
        } else {
            changeAvailable = true;
        }
        if (data.description == currentData.description) {
            formData.delete('description');
        }
        $.ajax({
            method: "POST",
            type: "POST",
            data: formData,
            url: `api/products/${productId}/edit`,
            contentType: false,
            processData: false,
            headers: { "X-CSRF-Token": $("meta[name='csrf-token']").attr("content") },
            success: function (result) {
                if(result.isSuccess) {
                    console.log(result);
                    loadingModal.setAttribute('hidden', 'hidden');
                    const item = button.parentElement;
                    if (newName) {
                        item.querySelector('.item__name').innerHTML = newName;
                    }
                    if (newPrice) {
                        item.querySelector('.item__price').innerHTML = newPrice + 'đ';
                    }
                    if (changeAvailable) {
                        if(data.available=='true') {
                            item.querySelector('.img-hover-zoom').classList.remove('item--empty');
                        } else {
                            item.querySelector('.img-hover-zoom').classList.add('item--empty');
                        }
                    };
                    if(result.newAvatar) {
                        item.querySelector('.item__img').setAttribute('src', result.newAvatar);
                    }
                } else {
                    completeSaveAvt(false);
                }
            },
            error: function (result) {
                completeSaveAvt(false);
            }
          });
    }