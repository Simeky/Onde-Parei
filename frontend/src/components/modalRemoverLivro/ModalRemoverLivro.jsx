export default function ModalRemover({ livro, aoConfirmar, aoCancelar }) {
  if (!livro) return null;

  return (
    <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1050 }}>
      <div className="card bg-dark text-light border-secondary p-4 shadow-lg" style={{ width: '350px', borderRadius: '12px'}}>
        <h5 className="mb-3 text-danger">Remover da Biblioteca</h5>
        <p className="small mb-4 text-secondary">
          Tem certeza que deseja remover <strong>{livro.titulo}</strong> da sua biblioteca? Você perderá suas anotações e a página em que parou.
        </p>
        <div className="d-flex justify-content-between">
          <button className="btn btn-outline-danger px-4" onClick={aoConfirmar}>Remover</button>
          <button className="btn btn-outline-secondary px-4 border-secondary" onClick={aoCancelar}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}