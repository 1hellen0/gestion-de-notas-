function validar(esquema) {
  return (req, res, next) => {
    const resultado = esquema.safeParse(req.body);

    if (!resultado.success) {
      return res.status(400).json({ errores: resultado.error.issues });
    }

    req.body = resultado.data;
    return next();
  };
}

module.exports = validar;
