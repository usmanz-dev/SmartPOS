import { formatCurrency, formatDateTime } from '../../utils/formatCurrency';
import { useRef } from 'react';

export default function Invoice({ order, onClose }) {
  const printRef = useRef();

  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=900,height=900');
    const printContent = printRef.current.innerHTML;

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice #${order.orderNumber}</title>
          <style>
            @page { size: auto; margin: 20mm; }
            body {
              font-family: 'Segoe UI', sans-serif;
              background: #ffffff;
              padding: 40px;
              color: #111;
            }
            .invoice-wrapper {
              max-width: 800px;
              margin: auto;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 2px solid #000;
              padding-bottom: 15px;
              margin-bottom: 20px;
            }
            .brand h1 {
              font-size: 28px;
              margin: 0;
              letter-spacing: 2px;
            }
            .brand span {
              font-size: 13px;
              color: #555;
            }
            .meta {
              text-align: right;
              font-size: 14px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th {
              text-align: left;
              padding: 12px 8px;
              border-bottom: 2px solid #000;
              font-size: 14px;
            }
            td {
              padding: 10px 8px;
              border-bottom: 1px solid #ddd;
              font-size: 13px;
            }
            .text-right { text-align: right; }
            .summary {
              margin-top: 20px;
              width: 300px;
              margin-left: auto;
            }
            .summary div {
              display: flex;
              justify-content: space-between;
              padding: 6px 0;
              font-size: 14px;
            }
            .grand-total {
              font-size: 18px;
              font-weight: bold;
              border-top: 2px solid #000;
              padding-top: 10px;
              margin-top: 10px;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              font-size: 12px;
              color: #777;
            }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-4xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-white/10 overflow-hidden">

        {/* HEADER SUCCESS */}
        <div className="p-6 text-center border-b border-white/10">
          <h2 className="text-2xl font-bold text-emerald-400 tracking-wide">
            Payment Successful
          </h2>
          <p className="text-slate-400 mt-1">Order #{order.orderNumber}</p>
        </div>

        {/* INVOICE BODY */}
        <div
          ref={printRef}
          className="p-8 bg-white text-black overflow-y-auto max-h-[600px]"
        >
          <div className="invoice-wrapper">

            {/* Invoice Header */}
            <div className="flex justify-between items-start border-b pb-6">
              <div>
                <h1 className="text-3xl font-extrabold tracking-wider">
                  SMARTPOS PRO
                </h1>
                <p className="text-gray-500 text-sm">
                  Premium Multi-Store POS System
                </p>
              </div>

              <div className="text-right text-sm space-y-1">
                <p><strong>Invoice:</strong> #{order.orderNumber}</p>
                <p><strong>Date:</strong> {formatDateTime(order.createdAt)}</p>
                <p><strong>Cashier:</strong> {order.cashier?.name || 'N/A'}</p>
                <p><strong>Payment:</strong> {order.paymentMethod}</p>
              </div>
            </div>

            {/* Items Table */}
            <table className="mt-6 w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th>Item</th>
                  <th className="text-center">Qty</th>
                  <th className="text-right">Price</th>
                  <th className="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items?.map((item, i) => (
                  <tr key={i}>
                    <td>{item.name}</td>
                    <td className="text-center">{item.quantity}</td>
                    <td className="text-right">{formatCurrency(item.price)}</td>
                    <td className="text-right">{formatCurrency(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Summary */}
            <div className="summary mt-8 ml-auto text-sm">
              <div>
                <span>Subtotal:</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div>
                <span>Tax:</span>
                <span>{formatCurrency(order.taxAmount)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="text-green-600">
                  <span>Discount:</span>
                  <span>-{formatCurrency(order.discountAmount)}</span>
                </div>
              )}
              <div className="grand-total">
                <span>Total:</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
              <div>
                <span>Paid:</span>
                <span>{formatCurrency(order.amountPaid)}</span>
              </div>
              {order.change > 0 && (
                <div>
                  <span>Change:</span>
                  <span>{formatCurrency(order.change)}</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="footer mt-12 border-t pt-6">
              <p>Thank you for your business.</p>
              <p>Powered by SmartPOS Pro</p>
              <p>{new Date().toLocaleString()}</p>
            </div>

          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex gap-4 p-6 border-t border-white/10 bg-slate-900">
          <button
            onClick={handlePrint}
            className="flex-1 py-3 rounded-xl bg-white text-black font-semibold hover:scale-[1.02] transition"
          >
            🖨 Print Invoice
          </button>

          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition"
          >
            New Order
          </button>
        </div>
      </div>
    </div>
  );
}