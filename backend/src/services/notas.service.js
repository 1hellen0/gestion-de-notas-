const AppError = require('../utils/errors');

let notas = [];
let siguienteId = 1;

function listar() {
  return notas;
}

function buscar(id) {
  const idNumerico = Number(id);
  const nota = notas.find((elemento) => elemento.id === idNumerico);

  if (!nota) {
    throw new AppError(404, 'Nota no encontrada');
  }

  return nota;
}

function crear(datos) {
  const nota = {
    ...datos,
    id: siguienteId,
  };
  siguienteId += 1;
  notas.push(nota);
  return nota;
}

function eliminar(id) {
  const idNumerico = Number(id);
  const indice = notas.findIndex((nota) => nota.id === idNumerico);

  if (indice === -1) {
    throw new AppError(404, 'Nota no encontrada');
  }

  notas.splice(indice, 1);
  return true;
}

module.exports = {
  listar,
  buscar,
  crear,
  eliminar,
};
