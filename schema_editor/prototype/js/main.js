$(function() {
    $(document).on('click', '.edit', function(e){
       e.preventDefault();
       var $collapseElement = $(this).parent().parent().next('.form-collapse');
       var active = $collapseElement.hasClass('active');
       
       if (active){
           $('.form-collapse').removeClass('active');
       } else {
           $('.form-collapse').removeClass('active');
           $collapseElement.addClass('active');
       }
    });

    $(document).on('click', '.content-types > ul > li > a', function(e){
        e.preventDefault();
       
        $(this).parent().not('.active-parent').toggleClass('in');
    });

    $(".form-area-body").sortable();
}); 

