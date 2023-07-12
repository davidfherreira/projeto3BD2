function autenticacao(req,res,next) {
    if(req.session.usuario != undefined){
        next();
    }
    else{
    res.redirect('/login');
    }
}

module.exports = autenticacao;
