const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const {SECRET_KEY}= process.env;
const {REFRESH_SECRET_KEY}=process.env;
const {TIME_OF_LIFE_TOKEN} =process.env;
const  HttpError  = require("../../helpers/httpError");
const ctrlWrapper = require('../../helpers/ctrlWrapper');

const  { createClient } =require('@supabase/supabase-js');
const supabaseUrl = 'https://uuwnahknlrbjogoxtzwj.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const register = async (req, res) => {
  const { email, password } = req.body;


  const user = await supabase
  .from('users')
  .select('*')
  .eq('email', email);

  if (user.data.length > 0) {
    throw HttpError(409, "Email already in use");
  };
  const hashPassword = await bcrypt.hash(password, 10);

  const newUser =  await supabase
  .from('users')
  .insert([
    {
      email: email,
      password: hashPassword,
    },
  ]);

  const {data} = await supabase
  .from('users')
  .select('id')
  .eq('email', email)
  .eq('password', hashPassword);

if (data && data[0]) {
    const payloadAccess={id : data[0].id};
  
    const payloadRefresh={id : data[0].id};
    const accessToken =jwt.sign(payloadAccess, SECRET_KEY, { expiresIn: `${TIME_OF_LIFE_TOKEN}` });
    const refreshToken =jwt.sign(payloadRefresh, REFRESH_SECRET_KEY);
    res.status(201).json({ success: true, data: { id: data[0].id, accessToken, refreshToken } });
  } else {
    console.log('No data returned from the database');
  }
};


const login = async (req, res) => {
    const { email, password } = req.body;
  
    const user = await supabase
    .from('users')
    .select('*')
    .eq('email', email); 

     if (user.data.length === 0) {
      throw HttpError(404, "Email or password invalid or not exist");
    }
    const passwordCompare = await bcrypt.compare(password, user.data[0].password);
  
    if (!passwordCompare) {
      throw HttpError(401, "Password is invalid");
    }
  
    const payloadAccess={id : user.data[0].id};
  
    const accessToken =jwt.sign(payloadAccess, SECRET_KEY, { expiresIn: `${TIME_OF_LIFE_TOKEN}` } );
    
    const payloadRefresh={id : user.data[0].id};
    
    const refreshToken =jwt.sign(payloadRefresh, REFRESH_SECRET_KEY);
  
    res.status(200).json({success:true, 
      data:{id: user.data[0].uuid,
         accessToken,
         refreshToken, 
      }
    });
  };

module.exports = {
    register: ctrlWrapper(register),
    login: ctrlWrapper(login),
};
