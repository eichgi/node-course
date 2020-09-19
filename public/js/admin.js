const deleteProduct = (btn) => {
  const productId = btn.parentNode.querySelector('[name=productId]').value;
  const csrfToken = btn.parentNode.querySelector('[name=_csrf]').value;
  const productElement = btn.closest('article');

  fetch('/admin/product/' + productId, {
    method: 'delete',
    headers: {
      'csrf-token': csrfToken,
    }
  })
    .then(response => {
      return response.json();
    })
    .then(data => {
      productElement.remove();
    })
    .catch(error => {
      console.log(error);
    });
};