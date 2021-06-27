selectionUser = document.querySelector('#select-user');
const url = "api/accounts"

var template = Handlebars.compile($('#list-item-template').html());

selectionUser.onchange = function() {
    role = selectionUser.value;
    document.querySelector('#select-user').disabled = true;
    $(document).ready(function () {
        $('.toast').toast('hide');
    })
    txtKey.value = '';

    $.getJSON(url,
        {
            role,
        }
        , function(result) {
            console.log(result.docs);
            result.docs.forEach(user => {
                if(user.createdAt){
                    var date = new Date(user.createdAt);
                    user.createdAt = date.toLocaleString();
                }
                if(user._id == meId) {
                    user.me = true;
                }
                user.active = user.status == "ACTIVE" ? true : false;
                user.role = role;
            });


            var accountHtml = template({accounts: result.docs});
            $('#items-list').html(accountHtml);

            document.querySelector('#select-user').disabled = false; 
            
            setOnClickListener();
            
            //paginate;
            totalPages = result.totalPages;
            currentPage = result.currentPage;
            hasNextPage = result.hasNextPage;
            hasPrevPage = result.hasPrevPage;

            //Change URL
            var newParams = new URLSearchParams(window.location.search);

           // var oldType = newParams.get('role');
            //console.log(oldType);
            newParams.set('role', role);
            newParams.delete('page');
            var changedUrl =  window.location.pathname +'?' + newParams;

            //if(oldType) {
                history.replaceState({}, 'Product Admin - Dashboard', changedUrl);
            //} else {
            //   history.pushState({}, 'Product Admin - Dashboard', changedUrl);
            //}
            paginationBtn(role, behavior, totalPages, currentPage,hasPrevPage, hasNextPage);
        }
    )
}

function setOnClickListener(){
    //Sử lý khi nhấn vào nút "Block" , "UnBlock"
    btnStatuss = document.querySelectorAll('.tm-product-delete-link');
    
   
    btnStatuss.forEach(btnStatus => {
        var spinner = btnStatus.querySelector('#spinner-change-status');
        var id = btnStatus.getAttribute("id");
        btnStatus.onclick = function(event){
            event.preventDefault();
            
            var behavior = btnStatus.getAttribute("title");
            var child = btnStatus.querySelector('.fas');
            if(behavior=="Block") {
                child.classList.remove("fa-lock-open");
            } else if(behavior=="UnBlock") {
                child.classList.remove("fa-lock");
            }
            spinner.removeAttribute("hidden");

            $.getJSON('api/accounts/edit-status', {role, behavior, id}, (result)=>{
                changView(btnStatus, spinner, result.newStatus);
            })
          

        }
    })
}


getParent = function(element, selector){
    while(element.parentElement) {
        if(element.parentElement.matches(selector)) {
            return element.parentElement
        }
        element = element.parentElement;
    }
}

changView = function(btnStatus, spinner, newStatus) {
    
    spinner.setAttribute("hidden", "hidden");
    child = btnStatus.querySelector(".fas");
    var statusIcon = getParent(child, "tr").querySelector('.status-icon');

    if(newStatus == "BLOCK"){
        btnStatus.setAttribute("title", "UnBlock");

        child.classList.add("fa-lock");
        statusIcon.classList.remove("fa-circle");
        statusIcon.classList.add("fa-ban");
        statusIcon.setAttribute("title", "Status: BLOCK");

    } else if(newStatus == "ACTIVE") {
        btnStatus.setAttribute("title", "Block");

        child.classList.add("fa-lock-open");
        statusIcon.classList.remove("fa-ban");
        statusIcon.classList.add("fa-circle");
        statusIcon.setAttribute("title", "Status: ACTIVE");
    }
}

$('#detailAccountDialog').on('show.bs.modal', function (event) {
    button = $(event.relatedTarget); // Button that triggered the modal
    console.log(button);
    const AccountId = button.data('id');
    button = button.get(0);
    $.getJSON (`api/accounts/${AccountId}/detail`, function(result) {
        console.log(result);
        // var productHtml = templateModal({product: result});
        // currentData = result;
        // document.querySelector("#editProductDialog .modal-body").innerHTML = productHtml;
        // btnSaveChange.setAttribute('data-item-id',productId)
        // //btnDeleteProduct.setAttribute('data')
        // var i = 0;
        // imgs = [];
        // result.img.forEach(img => {
        //     imgs.push({index: i++, src: img});
        // });
        // updateImg();

    })
})


