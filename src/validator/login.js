const validator =require('validator');
const isEmpty =require ('./is-Empty');

module .exports=function validateLoginInput(data){
    let errors={};
    data.email=!isEmpty(data.email)? data.email:"";
    data.password=!isEmpty(data.password)?data.password:"";

    if (validator.isEmpty(data.email)){
        errors.email="email is required";
    }
    if (!validator.isEmail(data.email)){
        errors.email="email is invalid";
    }
    if (validator.isEmpty(data.password)){
        errors.password="password field is required";
    }
    if (!validator.isLength(data.password,{min:6,max:10})){
        errors.password="password should be at least six characters";
    }




    return{
        errors,
        isValid:isEmpty(errors)
    }

}
