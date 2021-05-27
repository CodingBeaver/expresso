const express = require("express");
const timesheetRouter = express.Router({mergeParams:true});
const sqlite3 = require("sqlite3");
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');
module.exports = timesheetRouter;


timesheetRouter.get("/",(req,res,next)=>{

    db.all("SELECT * FROM Timesheet WHERE employee_id=$employeeId",
    {$employeeId: req.params.employeeId},
    (err,timesheets)=>{
        if(err){next(err);}
        res.status(200).json({timesheets: timesheets})
    })
})

timesheetRouter.post("/",(req,res,next)=>{
    const hours = req.body.timesheet.hours;
    const rate = req.body.timesheet.rate;
    const date = req.body.timesheet.date;

    if (!hours || !rate || !date) {
        return res.sendStatus(400);
      } 
    else{
        const sql = "INSERT INTO Timesheet (hours, rate, date, employee_id)"+
        "VALUES ($hours, $rate, $date, $employeeId)";
        const values = {
            $hours: hours,
            $rate: rate,
            $date: date,
            $employeeId: req.params.employeeId
        }
        db.run(sql, values,function(err){
            if(err){next(err)}
            db.get(`SELECT * FROM Timesheet WHERE id=${this.lastID}`,(err,timesheet)=>{
                if(err){next(err)}
                res.status(201).json({timesheet: timesheet})
            })
        })


    }
})

timesheetRouter.param("timesheetId",(req,res,next,timesheetId)=>{
    db.get("SELECT * FROM Timesheet WHERE timesheet.id=$id",
    {
        $id: timesheetId
    },
    (err,timesheet)=>{

        if(err){
            next(err);
        }
        else if(timesheet)
        {
        req.timesheet= timesheet;
        next();
        }
        else{
             res.sendStatus(404);
        }
    })
})

timesheetRouter.put("/:timesheetId",(req,res,next)=>{

    const hours = req.body.timesheet.hours;
    const rate = req.body.timesheet.rate;
    const date = req.body.timesheet.date;

    if (!hours || !rate || !date) {
        return res.sendStatus(400);
      } 

    else{
    
    const sql = "UPDATE Timesheet SET hours=$hours, rate = $rate, date= $date, employee_id =$employeeId "
    +"WHERE id= $id";
    const values = {
        $hours: hours,
        $rate: rate,
        $date: date,
        $employeeId: req.params.employeeId,
        $id: req.params.timesheetId

    } ;
    db.run(sql, values, (err)=>{
        if(err){next(err)}
        db.get("SELECT * FROM Timesheet WHERE id=$id",{$id: req.params.timesheetId},(err,timesheet)=>{
            if(err){next(err)}
            res.status(200).json({timesheet: timesheet});
        })
    })
    }

})

timesheetRouter.delete("/:timesheetId",(req,res,next)=>{

    const sql="DELETE FROM Timesheet WHERE id=$id";
    const values ={ $id: req.params.timesheetId};

    db.run(sql, values, (err)=>{
        if(err){
            next(err);
        }
        res.sendStatus(204);
    })


})