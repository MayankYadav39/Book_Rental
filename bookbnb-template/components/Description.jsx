import { BiBookOpen, BiDollar } from 'react-icons/bi'
import { FiCalendar } from 'react-icons/fi'

const Description = ({ book }) => {
  return (
    <div className="py-5 border-b-2 border-b-slate-200 space-y-4">
      <h1 className="text-xl font-semibold">Description</h1>
      <p className="text-slate-500 text-lg w-full sm:w-4/5">{book?.description}</p>

      <div className="flex space-x-4">
        <BiDollar className="text-4xl" />
        <div>
          <h1 className="text-xl font-semibold">Price per day</h1>
          <p>{book?.pricePerDay} ETH</p>
        </div>
      </div>

      <div className="flex space-x-4">
        <BiDollar className="text-4xl" />
        <div>
          <h1 className="text-xl font-semibold">Deposit</h1>
          <p>{book?.deposit} ETH</p>
        </div>
      </div>

      <div className="flex space-x-4">
        <FiCalendar className="text-4xl" />
        <div>
          <h1 className="text-xl font-semibold">Rental period info</h1>
          <p>See calendar above to pick your rental dates.</p>
        </div>
      </div>
    </div>
  )
}

export default Description
