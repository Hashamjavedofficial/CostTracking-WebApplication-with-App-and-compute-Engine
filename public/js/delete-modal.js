function deleteModalHandler(id) {
    $('#confirm-delete').attr('href', '/admin/posts/delete/' + id);
}