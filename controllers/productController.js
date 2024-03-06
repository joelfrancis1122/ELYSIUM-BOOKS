const Product = require('../models/productModel')
const Category = require('../models/categoryModel')



const loadaddproduct = async (req, res) => {
    try {
        const categories = await Category.find(); // Assuming you're fetching categories from the database
        res.render('addproduct', { categories }); // Pass 'categories' to the EJS template
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
}
const addProduct= async(req,res)=>{
    try {
        console.log("s");
        console.log(req.files);
        const images = req.files.map(file => file.filename);
        
           const {Bookname,Description,Categories,Regularprice,stock,saleprice}=req.body
           const product = new Product({
            Bookname:Bookname,
            Description:Description,
            Categories:Categories,
            Regularprice:Regularprice,
            stock:stock,
            saleprice:saleprice,
            Images:images
           })
           
           const productData = await product.save()

           if(productData){
          console.log("success");
          res.render('admindashboard')
           }else{
            console.log("error");
           }
        
    } catch (error) {
        console.log(error)
    }
}


const loadeditProduct = async(req,res)=>{
    try{
        const id= req.query.id
        req.session.editProductId = id;
        const product = await Product.findById(id)
        const categories = await Category.find(); // Assuming you're fetching categories from the database

        res.render('editproduct',{product,categories})
        
    }catch(error){
        console.log(error);
    }
}

const editProduct = async (req,res)=>{

        try {
    console.log("keri")
              const Bookname = req.body.Bookname;
              const Description = req.body.Description;
              const Regularprice = req.body.Regularprice;
              const saleprice = req.body.saleprice;
              const stock = req.body.stock;

            const editProduct = await Product.findOne({_id:req.session.editProductId})
            editProduct.Bookname = Bookname
            editProduct.Description = Description;
            editProduct.Regularprice = Regularprice;
            editProduct.saleprice = saleprice;
            editProduct.stock = stock;

            if(req.files){
                const images = req.files.map(file => file.filename);
                console.log('images ',images);
                editProduct.Images=images
            }

            const productUpdateddata = await editProduct.save()
              if(productUpdateddata){
                console.log("success");
                 }else{
                  console.log("error");
                 }
            res.redirect("/admin/dashboard");
           
          } catch (err) {
            console.log(err.message);
}
}



const ToggleblockProduct = async (req,res)=>{
    try{
        const id= req.query.id
        const product = await Product.findOne({_id:id}); 
        product. is_Active=!product. is_Active
        await product.save()
        res.redirect('/admin/productslist');
    } catch (error) {
        console.log(error);
    }
}


module.exports = {
    loadaddproduct,
    addProduct,
    loadeditProduct,
    ToggleblockProduct,
    editProduct

}