import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { SerialPort } from 'serialport';
import { ReadlineParser } from 'serialport';
import pg from 'pg';
import env from 'dotenv';

const app = express();
env.config();
app.use(cors());
app.use(express.json());
const PORT = "5000";
const path = "COM3";
const baudRate = 9600;
const tableName = 'user';
const query = `
    SELECT EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = $1
    );
`;

// Update with your scale's correct port and baud rate
// const port = new SerialPort({
//     path: "COM3", // Windows: "COMx", Linux/Mac: "/dev/ttyUSB0"
//     baudRate: 9600, // Check scale specs
//     dataBits: 8, // Usually 8
//     stopBits: 1, // Usually 1
//     parity: "none", // Check if even/odd is required
//     flowControl: false, // Some scales need RTS/CTS
// });

// // Parser to read weight data
// const parser = port.pipe(new ReadlineParser({ delimiter: "\r\n" }));



const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", (ws) => {
    console.log("Client connected");

    // Simulate demo weight data
    let weight = 10.0;
    const interval = setInterval(() => {
        weight += Math.random() * 0.5; // Random weight change
        weight = parseFloat(weight.toFixed(2)); // Limit to two decimal places

        // Broadcast to all connected clients
        wss.clients.forEach((client) => {
            if (client.readyState === ws.OPEN) {
                client.send(JSON.stringify({ weight }));
            }
        });
    }, 1000); // Send data every 1 second

    // Handle client disconnection
    ws.on("close", () => {
        console.log("Client disconnected");
        clearInterval(interval); // Stop sending data when client disconnects
    });
});

const db = new pg.Client({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
});

db.connect().then(() => console.log('Connected to DB')).catch(err => console.error('Database connection error:', err));

// 
const checkDB = async(tableName, query)=>{
    try {
        const result = await db.query(query, [tableName]);
        return result;
    } catch (error) {
        res.status(500).json({ message: 'Error checking a link to database'});
    };
        
};
app.get('/db-con-check', async(req, res) =>{

    try {
        const tableExists = await checkDB(tableName, query);
        res.json({ status: tableExists ? "connected" : "not connected" });
    } catch (error) {
        res.status(500).json({ error: "Database check failed" });
    };

});

app.get('/scale-con-check', async(req, res) =>{

    try {
        const result = await db.query('SELECT * FROM scale_params');
        if(result.rows.length > 0){
            const data = {
                scaleParams: result.rows[0],
                status: 'saved',
            }
            res.json(data);
        };
    } catch (error) {
        res.status(500).json({ error: "No scale configuration saved" });
    };

});

app.get('/print-type-param', async(req, res)=>{
    try {
        const result = await db.query('SELECT * FROM print_type');
        if(result.rows.length > 0){
            const data = {
                printType: result.rows[0],
                status: 'saved',
            };
            res.json(data);
        };
    } catch (error) {
        res.status(500).json({ error: "No print type configuration saved" });
    };
});

app.post('/db-config', async(req, res) => {    

        try {
            const tableExists = await checkDB(tableName, query);
            if(tableExists){
            res.status(200).json({ message: 'Database Configuration was successful'});
            } else{
                res.status(404).json({ message: 'Database Configuration failed'});
            }
        } catch (error) {
            res.status(500).json({ message: 'Database configuration failed'});
        };
});

app.post('/scale-config', async(req, res)=>{

    try {
        await db.query('INSERT INTO scale_params (port, baud_rate, databits, stopbits, parity, flow_control) VALUES ($1, $2, $3, $4, $5, $6)', 
            [req.body.port, req.body.baudRate, req.body.dataBits, req.body.stopBits, req.body.parity, req.body.flowControl]);
            res.status(200).json({ message: 'Scale Configuration was saved successful'});
    } catch (error) {
        res.status(500).json({ message: 'Error saving scale configuration'});
        console.error('Error saving scale configuration:', error);
    };
});

app.post('/update-scale-config', async(req, res) => {
    try {
        await db.query('UPDATE scale_params SET port=$1, baud_rate=$2, databits=$3, stopbits=$4, parity=$5, flow_control=$6 WHERE id=1', 
            [req.body.port, req.body.baudRate, req.body.dataBits, req.body.stopBits, req.body.parity, req.body.flowControl]);
            res.status(200).json({ message: 'Scale Configuration was updated successfully'});
    } catch (error) {
        res.status(500).json({ message: 'Error updating scale configuration'});
        console.error('Error updating scale configuration:', error);
    };
 
});

app.post('/print-type', async(req, res) =>{
    try {
        const trueKey = Object.keys(req.body).find(key => req.body[key] === true);
        const result = await db.query('SELECT * FROM print_type WHERE id = 1');
        if(result.rows.length > 0){

            await db.query('UPDATE print_type SET id=$1, ptype=$2 WHERE id = 1', [1, trueKey]);
            res.json({ message: 'Print type was updated successfully'});
        }else{
            await db.query('INSERT INTO print_type (id, ptype) VALUES ($1, $2)', [1, trueKey])
            res.json({ message: 'Print Type was saved successfully'});
        };
    } catch (error) {
        console.error("Error: saving print type to db: " + error);
        res.json({ message: 'Error saving print type to db'});
    }
   
});

app.post('/transactions', async(req, res)=>{

    try {
    
        await db.query('INSERT INTO transact (tid, first_weight, last_weight, tare_weight, net_weight, gross_weight, company, address, product, carrier, operator, dest, tel, vehicle_no, batch_no, ops_type, unit, fw_date, sw_date, tw_date, nw_date, gw_date ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)', 
            [req.body.clientData.tid || null, req.body.weighData.istCap || null, req.body.weighData.secCap || null, req.body.weighData.tareCap || null, req.body.weighData.netCap || null, req.body.weighData.grossCap || null, req.body.clientData.client || null, req.body.clientData.address || null, req.body.clientData.product || null, req.body.clientData.carrier || null, req.body.clientData.operator || null, req.body.clientData.dest || null, req.body.clientData.tel || null, req.body.clientData.vehicleNo || null, req.body.clientData.batchNo || null, req.body.ops_type || null, req.body.clientData.unit || null, req.body.weighData.fDate || null, req.body.weighData.sDate || null, req.body.weighData.tDate || null, req.body.weighData.nDate || null, req.body.weighData.gDate || null ]);
            res.status(200).json({ message: `transaction with Id: ${req.body.clientData.tid } was saved successfully`});
    } catch (error) {
        res.status(500).json({ message: 'Error updating weigh transaction'});
        console.error('Error updating weigh transaction:', error);
    }; 
});
app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`);
});