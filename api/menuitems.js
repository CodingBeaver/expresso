const express = require("express");
const menuItemRouter = express.Router({mergeParams:true});
const sqlite3 = require("sqlite3");
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');
module.exports = menuItemRouter;



menuItemRouter.get("/",(req,res,next)=>{

    db.all("SELECT * FROM MenuItem WHERE menu_id=$menuId",
    {$menuId: req.params.menuId},
    (err,menuItems)=>{
        if(err){next(err);}
        res.status(200).json({menuItems: menuItems})
    })
})

menuItemRouter.post("/",(req,res,next)=>{
    const name = req.body.menuItem.name;
    const description = req.body.menuItem.description;
    const inventory = req.body.menuItem.inventory
    const price = req.body.menuItem.price;

    if (!name || !description || !inventory || !price) {
        return res.sendStatus(400);
      } 
    else{
        const sql = "INSERT INTO MenuItem (name, description, inventory, price, menu_id)"+
        "VALUES ($name, $description, $inventory, $price, $menuId)";
        const values = {
            $name: name,
            $description: description,
            $inventory: inventory,
            $price: price,
            $menuId: req.params.menuId
        }
        db.run(sql, values, function(err){
            if(err){next(err)}
            db.get(`SELECT * FROM MenuItem WHERE id=${this.lastID}`,(err,menuItem)=>{
                if(err){next(err)}
                res.status(201).json({menuItem: menuItem})
            })
        })


    }
})

menuItemRouter.param("menuItemId",(req,res,next,menuItemId)=>{
    db.get("SELECT * FROM MenuItem WHERE MenuItem.id=$id",
    {
        $id: menuItemId
    },
    (err,menuItem)=>{

        if(err){
            next(err);
        }
        else if(menuItem)
        {
        req.menuItem= menuItem;
        next();
        }
        else{
             res.sendStatus(404);
        }
    })
})

menuItemRouter.put("/:menuItemId",(req,res,next)=>{

    const name = req.body.menuItem.name;
    const description = req.body.menuItem.description;
    const inventory = req.body.menuItem.inventory
    const price = req.body.menuItem.price;

    if (!name || !description || !inventory || !price) {
        return res.sendStatus(400);
      } 

    else{
    
    const sql = "UPDATE MenuItem SET name=$name, description=$description, inventory=$inventory, price= $price, menu_id =$menuId WHERE MenuItem.id=$id";
    const values = {
            $name: name,
            $description: description,
            $inventory: inventory,
            $price: price,
            $menuId: req.params.menuId,
            $id: req.params.menuItemId

    } ;
    db.run(sql, values,function(err){
        if(err){next(err)}
        db.get(`SELECT * FROM MenuItem WHERE MenuItem.id=$id`,{$id: req.params.menuItemId},(err,menuItem)=>{
            if(err){next(err)}
            res.status(200).json({menuItem: menuItem})
        })
    })
}
});

menuItemRouter.delete("/:menuItemId",(req,res,next)=>{

    const sql="DELETE FROM MenuItem WHERE id=$id";
    const values ={ $id: req.params.menuItemId};

    db.run(sql, values, (err)=>{
        if(err){
            next(err);
        }
        res.sendStatus(204);
    })


})