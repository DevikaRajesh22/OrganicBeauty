//orders() GET request
exports.orders=async(req,res)=>{
    try{
        const pageName='Orders';
        res.render('admin/orders',{pageName});
    }catch(error){
        console.log(error.message);
    }
};