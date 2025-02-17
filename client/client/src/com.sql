-- Tables
create table transact (
	tid varchar(50) primary key not null unique,
	first_weight numeric,
	last_weight numeric,
	tare_weight numeric,
	net_weight numeric,
	gross_weight numeric,
    company text,
    address text,
    product text,
    carrier text,
	operator text,
    dest text,
    tel text,
	vehicle_no text,
    batch_no varchar(50),
	ops_type varchar(50),
	unit varchar(10),
	fw_date TIMESTAMPTZ DEFAULT NOW(),
	sw_date TIMESTAMPTZ DEFAULT NOW(),	
	tw_date TIMESTAMPTZ DEFAULT NOW(),	
	nw_date TIMESTAMPTZ DEFAULT NOW(),	
	gw_date TIMESTAMPTZ DEFAULT NOW()	
)


create table scale_params (
	id serial primary key,
	baud_rate int,
	databits int,
	stopbits int,
	parity text,
	flow_control text
);

create table print_type (
	id int,
	ptype text
);


-- check database link exists query
 const tableName = 'users';
        const query = `
            SELECT EXISTS (
                SELECT 1 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = $1
            );
        `;
        
const result = await db.query(query, [tableName]);


const result = await db.query('SELECT * FROM scale_params');

await db.query('UPDATE scale_params SET port=$1, baud_rate=$2, databits=$3, stopbits=$4, parity=$5, flow_control=$6 WHERE id=1', 
            [req.body.port, req.body.baudRate, req.body.dataBits, req.body.stopBits, req.body.parity, req.body.flowControl]);

await db.query('INSERT INTO scale_params (port, baud_rate, databits, stopbits, parity, flow_control) VALUES ($1, $2, $3, $4, $5, $6)', 
            [req.body.port, req.body.baudRate, req.body.dataBits, req.body.stopBits, req.body.parity, req.body.flowControl]);

