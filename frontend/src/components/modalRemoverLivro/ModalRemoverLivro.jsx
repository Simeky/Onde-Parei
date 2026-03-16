import './ModalRemoverLivro.css';

export default function ModalRemover({ livro, aoConfirmar, aoCancelar }) {
  if (!livro) return null;

  return (
    <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50">
      <div className="card text-body bg-body order-secondary p-4 shadow-lg modal-remover-content">
        <h5 className="mb-3 text-danger">Remover da Biblioteca</h5>
        <p className="small mb-4 text-secondary">
          Tem certeza que deseja remover <strong>{livro.titulo}</strong> da sua biblioteca? Você perderá as suas anotações e a página em que parou.
        </p>
        <div className="d-flex justify-content-between mt-2">
          <button className="btn btn-danger px-4" onClick={aoConfirmar}>Remover</button>
          <button className="btn btn-outline-secondary px-4 border-secondary" onClick={aoCancelar}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}