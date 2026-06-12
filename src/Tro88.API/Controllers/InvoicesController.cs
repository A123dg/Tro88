using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Tro88.Application.Constants;
using Tro88.Application.Common;
using Tro88.Application.Services;
using Tro88.Application.Features.Invoices.Commands.MarkInvoiceAsPaid;
using Tro88.Application.Features.Invoices.Commands.SendInvoice;
using Tro88.Application.Features.Invoices.Queries.GetInvoicePdf;
using Tro88.Application.Features.Invoices.Queries.GetInvoiceById;
using Tro88.Application.Features.Invoices.Commands.NotifyInvoicePayment;

namespace Tro88.API.Controllers;

[Authorize]
public class InvoicesController : BaseApiController
{
    [HttpGet]
    public async Task<IActionResult> GetInvoices([FromQuery] GetInvoicesQuery query)
    {
        var result = await Mediator.Send(query);
        return Ok(ApiResponse<List<InvoiceDto>>.Ok(
            result.Items,
            metaData: new MetaData
            {
                Page = query.Page,
                PageSize = query.PageSize,
                Total = result.Total,
                TotalPage = result.TotalPage
            }));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetInvoiceById(Guid id)
    {
        var result = await Mediator.Send(new GetInvoiceByIdQuery(id));
        return Ok(ApiResponse<InvoiceDto>.Ok(result));
    }

    [HttpPost]
    public async Task<IActionResult> CreateInvoice([FromBody] CreateInvoiceCommand command)
    {
        var result = await Mediator.Send(command);
        return Ok(ApiResponse<InvoiceDto>.Ok(result, SuccessMessages.CREATE_INVOICE_SUCCESS));
    }

    [HttpPost("bulk")]
    public async Task<IActionResult> CreateBulkInvoices(
        [FromBody] CreateBulkInvoicesCommand command)
    {
        var result = await Mediator.Send(command);
        return Ok(ApiResponse<List<InvoiceDto>>.Ok(
            result, SuccessMessages.CREATE_INVOICE_SUCCESS));
    }

    [HttpPatch("{id}/mark-paid")]
    public async Task<IActionResult> MarkInvoiceAsPaid(Guid id)
    {
        var result = await Mediator.Send(new MarkInvoiceAsPaidCommand(id));
        return Ok(ApiResponse<InvoiceDto>.Ok(result, SuccessMessages.MARK_INVOICE_PAID_SUCCESS));
    }

    [HttpPatch("{id}/notify-payment")]
    public async Task<IActionResult> NotifyInvoicePayment(Guid id)
    {
        var result = await Mediator.Send(new NotifyInvoicePaymentCommand(id));
        return Ok(ApiResponse<InvoiceDto>.Ok(result, "NOTIFY_PAYMENT_SUCCESS"));
    }

    [HttpPost("{id}/send")]
    public async Task<IActionResult> SendInvoice(Guid id)
    {
        await Mediator.Send(new SendInvoiceCommand(id));
        return Ok(ApiResponse<object>.Ok(
            null, SuccessMessages.SEND_INVOICE_SUCCESS));
    }

    [HttpGet("{id}/pdf")]
    public async Task<IActionResult> GetInvoicePdf(Guid id)
    {
        var pdf = await Mediator.Send(new GetInvoicePdfQuery(id));
        return Ok(ApiResponse<string>.Ok(Convert.ToBase64String(pdf)));
    }
}
