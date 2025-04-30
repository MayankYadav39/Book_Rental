const Title = ({ book }) => {
  return (
    <div>
      <h1 className="text-3xl font-semibold capitalize">{book?.title}</h1>
      <div className="flex justify-between">
        <div className="flex items-center mt-2 space-x-2 text-lg text-slate-500">
          Deposit: {book?.deposit} ETH
        </div>
      </div>
    </div>
  )
}

export default Title
