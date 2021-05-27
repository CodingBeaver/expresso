const express = require('express');
const menuRouter = express.Router();
const menuItemRouter = require("./menuitems");
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

module.exports = menuRouter;

menuRouter.get("/",(req,res,next)=>{
    db.all("SELECT * FROM Menu",(err,menus)=>{
        if(err){next(err)}
        res.status(200).json({menus});
    })
})

menuRouter.post("/",(req,res,next)=>{
    const title = req.body.menu.title;
    
if (!title)
{
    return res.sendStatus(400);
}
    const sql = "INSERT INTO Menu (title) VALUES ($title)";

    db.run(sql,{$title: title}, function(err){
        if(err){next(err)}
        db.get(`SELECT * FROM Menu WHERE id=${this.lastID}`,(err,menu)=>{
            if(err){next(err)}
            res.status(201).json({menu: menu});
        })
    })
})

menuRouter.param("menuId",(req,res,next,menuId)=>{

    const sql = 'SELECT * FROM Menu WHERE Menu.id = $menuId';
  const values = {$menuId: menuId};
  db.get(sql, values, (error, menu) => {
    if (error) {
      next(error);
    } else if (menu) {
      req.menu = menu;
      next();
    } else {
      res.sendStatus(404);
    }
  })
});

menuRouter.get("/:menuId",(req,res,next)=>{
    res.status(200).json({menu: req.menu});
})

menuRouter.put("/:menuId",(req,res,next)=>{
    const title= req.body.menu.title;
    if(!title)
    {
        return res.sendStatus(400);
    }
    db.run(`UPDATE Menu SET title=$title WHERE id=$id`,
    {
    $title:req.body.menu.title,
    $id:req.params.menuId
    },
    (err)=>{
        if(err)
        {next(err);}
        db.get(`SELECT * FROM Menu WHERE Menu.id=${req.params.menuId}`,
        (err,menu)=>{
            if(err)
            {next(err);}
            res.status(200).json({menu: menu});
        })
    })
});

menuRouter.delete("/:menuId",(req,res,next)=>{
    db.get("SELECT * FROM MenuItem WHERE MenuItem.menu_id=$menuId",
    {$menuId: req.params.menuId},
    (err,item)=>{
        if(err)
        {
            next(err);
        }
        else if(item){
           return res.sendStatus(400);
        }
        else{

            db.run("DELETE FROM Menu WHERE Menu.id=$id",
            {$id: req.params.menuId},
            (err)=>{
                if(err){next(err)}
                res.sendStatus(204);
            }
            )
        }

    })
});

menuRouter.use("/:menuId/menu-items",menuItemRouter);