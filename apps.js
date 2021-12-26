const client = contentful.createClient({
  // This is the space ID. A space is like a project folder in Contentful terms
  space: "311ef936kslg",
  // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
  accessToken: "SalemiqGNHEVmtojN17gjqfTF9HmGL4oDWbidnrx88k"
});


// variables
const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-cart');
const cartDOM = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productDOM = document.querySelector('.products-center');

// carts
let cart = [];
//buttons cart
let buttonDOM = [];
// getting the product
class Product{
 async getProducts(){
   try{

    const response = await client.getEntries({
      content_type: 'shoppingWebsite'// specific project file online if you have more content model in contentful .
    });
    // this is for products.json file static
    // let result = await fetch('products.json')
    // let data = await result.json()// return json file
    // from contentful site
    let products = response.items;// from contentful
    //let products = data.items;// from products.json

    products = products.map(item => {
      // const title = item.fields.title;// same as const {title} = item.fields
      // const price = item.fields.price;
      const {title,price} = item.fields;// same as above
      const {id} = item.sys;// same as const id = item.sys.id;

      const image = item.fields.image.fields.file.url;

      // const {url} = item.fields.image.fields.file;
      // {url} = item.fields.image.fields.file :find the file named as url in (item.fields.image.fields.file ) and put in const variable url 
      
      return {title,price,id,image};
    });
    return products
   }catch(error){
     console.log(error);
   }
  }
        // getProducts(){
        //   let result = fetch('products.json')
        //   .then( response => response.json())
          
        //   return result;

        // }
        
  }

// display product
class UI{
  displayProduct(products){
    let result = '';
    products.forEach(product => {
      result += `
      <article class="product">
				<div class="img-container">
					<img src=${product.image} class="product-img">
					<button class="bag-btn" data-id=${product.id}>
						<i class="fas fa-shopping-cart"></i>
						add to bag
					</button>
				</div>
				<h3>${product.title}</h3>
				<h4>$${product.price}</h4>
			</article>
      `;
    });
    productDOM.innerHTML = result;
  }
  getBagButtons(){
    
    const buttons = [...document.querySelectorAll('.bag-btn')];//queryselectorall  return node list above line change node list to array;
    //console.log(buttons); //  have all button in array form
    buttonDOM = buttons;
    buttons.forEach(button => {
      let id = button.dataset.id;
    // dataset attibute have id we have to set html data attribute like in line 59; it gives id of each items
      let inCart = cart.find(item => item.id ===  id);
      if(inCart){
        button.innerText = 'In Cart';
        button.disabled = true;
      }
      button.addEventListener('click', (event)=>{
        // console.log(event);
        event.target.innerText = "In Cart";
        event.target.disabled = true;
        // get product from products 
        let cartItem = {...Storage.getProduct(id), amount:1};// to add the property we spread the object and pass second parameter like amount property;
        // add product to cart
        cart = [...cart, cartItem];// SAME cart.push(cartItem);
        //save cart in local storage
        Storage.saveChart(cart);
        // set cart values
        this.setCartValue(cart);
        // display cart item
        this.addCartItem(cartItem);
        // show the cart
        this.showCart();

        
      })
    });
  }
  setCartValue(cart){
    let tempTotal = 0;
    let itemsTotal = 0;
    cart.map(item => {
      tempTotal += item.price * item.amount;
      itemsTotal += item.amount;
    });
    cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
    cartItems.innerText = itemsTotal;
  }
  addCartItem(item){
    const div = document.createElement('div');
    div.classList.add('cart-item');
    div.innerHTML = `
    <img src=${item.image} alt="cart-part">
					<div >
						<h4>${item.title}</h4>
						<h5>$${item.price}</h5>
						<div class="remove-item" data-id=${item.id}>remove</div>
					</div>
					<div>
						<i class="fas fa-chevron-up" data-id=${item.id}></i>
						<p class="item-amount">${item.amount}</p>
						<i class="fas fa-chevron-down " data-id=${item.id}></i>
					</div>
    `;
    cartContent.appendChild(div);
  }
  showCart(){
    cartOverlay.classList.add('transparentBcg');
    cartDOM.classList.add('showCart');
  }
  setupApp(){
    cart = Storage.getCart(); 
    this.setCartValue(cart);// add value  to cart which are in cart;
    this.populate(cart);
    cartBtn.addEventListener('click', this.showCart);
    closeCartBtn.addEventListener('click', this.hideCart);
  }
  populate(carts){
    carts.forEach(cart => this.addCartItem(cart));
  }
  hideCart(){
    cartOverlay.classList.remove('transparentBcg');
    cartDOM.classList.remove('showCart');
  }
  cartLogic(){
    //clearCartBtn.addEventListener('click', this.clearCart); this will not work this.clearCart this function return button not the method clearcart();
    clearCartBtn.addEventListener('click', ()=>{
      this.clearCart()
    });
    // cart functionality
    cartContent.addEventListener('click', event =>{
      if(event.target.classList.contains('remove-item')){
        let removeItem = event.target;
        let id = removeItem.dataset.id;
        cartContent.removeChild(removeItem.parentElement.parentElement);
        this.removeItem(id);
      }
      else if(event.target.classList.contains('fa-chevron-up')){
        let addAmount =event.target;
        let id = addAmount.dataset.id;
        let tempItem = cart.find(item => item.id === id);
        tempItem.amount = tempItem.amount + 1;
        Storage.saveChart(cart);
        this.setCartValue(cart);
        addAmount.nextElementSibling.innerText = tempItem.amount;
      }
      else if(event.target.classList.contains('fa-chevron-down')){
        let lowerAmount = event.target;
        let id = lowerAmount.dataset.id;
        let tempItem = cart.find(item => item.id === id);
        tempItem.amount = tempItem.amount - 1;
        if((tempItem.amount) > 0){
          Storage.saveChart(cart);
          this.setCartValue(cart);
          lowerAmount.previousElementSibling.innerText = tempItem.amount;
        }
        else{
          cartContent.removeChild(lowerAmount.parentElement.parentElement);
          this.removeItem(id);
        }
      }
    })
  }
  clearCart(){
    let cartItems = cart.map(item => item.id);
    // get all the id's in cart
    cartItems.forEach(id => this.removeItem(id));
    while(cartContent.children.length > 0){
      cartContent.removeChild(cartContent.children[0]);
    }
    this.hideCart();
  }
  removeItem(id){
    cart = cart.filter(item => item.id !== id);
    this.setCartValue(cart);
    Storage.saveChart(cart);
    let button = this.getSingleButton(id);
    button.disabled = false;
    button.innerHTML = `<i class= "fas fa-shopping-cart"></i> add to cart`;
  }
  getSingleButton(id){
    return buttonDOM.find(button => button.dataset.id === id);
  }
}

// local storage
class Storage{
  static saveProducts(products){
    localStorage.setItem('products', JSON.stringify(products))
  }
  static getProduct(id){
    let products = JSON.parse(localStorage.getItem('products'));
    
    return products.find(product => product.id === id)
  }
  static saveChart(cart){
    localStorage.setItem('cart', JSON.stringify(cart));
  }
  static getCart(){
     return localStorage.getItem('cart')?JSON.parse(localStorage.getItem('cart')) : [];
     //SAME ::
    // if(localStorage.getItem('cart')){
    //   return JSON.parse(localStorage.getItem('cart'));
    // }
    // else{
    //   return [];
    // }
  }
}
//
document.addEventListener('DOMContentLoaded', () => {
  const ui = new UI();
  const products = new Product();
  //setup application
  ui.setupApp();
  // get all products
  products.getProducts().then( data => {
    ui.displayProduct(data);
    Storage.saveProducts(data);
  }).then(()=>{
    ui.getBagButtons();
    ui.cartLogic();
  });
 
});
