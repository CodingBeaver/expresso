const express = require("express");
const employeeRouter = express.Router();
const sqlite3 = require("sqlite3");
const timesheetRouter = require("./timesheets");
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const postCheck = (req,res,next)=>{
    const name = req.body.employee.name;
    const position = req.body.employee.position;
    const wage = req.body.employee.wage;

    if (!name || !position || !wage) {
        return res.sendStatus(400);
      } 
      else{
      next();
      }
}



employeeRouter.get("/",(req,res,next)=>{

    db.all("SELECT * FROM Employee WHERE is_current_employee= 1",(err,employees)=>{
        if(err){ next(err);}
        res.status(200).json({employees:employees});
    })


});

employeeRouter.post("/", postCheck, (req,res,next)=>{
    
    const isCurrentEmployee = req.body.employee.isCurrentEmployee === 0 ? 0:1;

    db.run(`INSERT INTO Employee (name, position, wage, is_current_employee)
    VALUES ($name, $position, $wage, $isCurrentEmployee)
    `,
    {
        $name: req.body.employee.name,
        $position: req.body.employee.position,
        $wage: req.body.employee.wage,
        $isCurrentEmployee: isCurrentEmployee
    },
    function(err){
        if(err){
            next(err);
        }
        db.get(`SELECT * FROM Employee WHERE id=${this.lastID}`,
        (err, employee)=>{
            if(err){
                next(err);
            }
            res.status(201).json({employee: employee})

        })
    }

    
    )});
employeeRouter.param("employeeId",(req,res,next,employeeId)=>{

    db.get("SELECT * FROM Employee WHERE Employee.id=$id",
    {
        $id: employeeId
    },
    (err,employee)=>{

        if(err){
            next(err);
        }
        else if(employee)
        {
        req.employee= employee;
        next();
        }
        else{
             res.sendStatus(404);
        }
    })
});


employeeRouter.get("/:employeeId",(req,res,next)=>{
    res.status(200).json({employee:req.employee})
})
;

employeeRouter.put("/:employeeId",(req,res,next)=>{

    const name = req.body.employee.name,
    position = req.body.employee.position,
    wage = req.body.employee.wage,
    isCurrentEmployee = req.body.employee.isCurrentEmployee === 0 ? 0 : 1;
if (!name || !position || !wage) {
return res.sendStatus(400);
}
 
const sql = 'UPDATE Employee SET name = $name, position = $position, ' +
'wage = $wage, is_current_employee = $isCurrentEmployee ' +
'WHERE Employee.id = $employeeId';
const values = {
    $name: name,
    $position: position,
    $wage: wage,
    $isCurrentEmployee: isCurrentEmployee,
    $employeeId: req.params.employeeId
};
db.run(sql, values,
    (err)=>{
        if(err){
            next(err);
        }

    db.get("SELECT * FROM Employee WHERE Employee.id=$id",
    {$id:req.params.employeeId},
    (err,employee)=>{
        
        
        res.status(200).json({employee:employee});
        
    })
})

}); 

employeeRouter.delete("/:employeeId",(req,res,next)=>{

    

    db.run("UPDATE Employee SET is_current_employee=0 WHERE id=$id",{$id: req.params.employeeId},(err)=>{
        db.get("SELECT * FROM Employee WHERE Employee.id=$id",
        {$id:req.params.employeeId},
        (err,employee)=>{
            
            
            res.status(200).json({employee:employee});
            
        })
    })


});

employeeRouter.use("/:employeeId/timesheets",timesheetRouter);


  


module.exports = employeeRouter;