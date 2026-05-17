using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Tro88.Application.Common.Constants;
using Tro88.Application.Common.Models;
using Tro88.Application.Features.Contracts.Commands.CreateContract;
using Tro88.Application.Features.Contracts.Commands.ActivateContract;
using Tro88.Application.Features.Contracts.Commands.TerminateContract;
using Tro88.Application.Features.Contracts.Queries.GetContracts;
using Tro88.Application.Features.Contracts.DTOs;
using Tro88.Application.Features.Contracts.Queries.GetContractById;
using Tro88.Application.Features.Contracts.Queries.GetContractTenants;

namespace Tro88.API.Controllers;

[Authorize]
public class ContractsController : BaseApiController
{
    [HttpGet]
    public async Task<IActionResult> GetContracts([FromQuery] GetContractsQuery query)
    {
        var result = await Mediator.Send(query);
        return Ok(ApiResponse<List<ContractDto>>.Ok(
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
    public async Task<IActionResult> GetContractById(Guid id)
    {
        var result = await Mediator.Send(new GetContractByIdQuery(id));
        return Ok(ApiResponse<ContractDto>.Ok(result));
    }

    [HttpPost]
    public async Task<IActionResult> CreateContract([FromBody] CreateContractCommand command)
    {
        var result = await Mediator.Send(command);
        return Ok(ApiResponse<ContractDto>.Ok(result, SuccessMessages.CREATE_CONTRACT_SUCCESS));
    }

    [HttpPatch("{id}/activate")]
    public async Task<IActionResult> ActivateContract(Guid id)
    {
        var result = await Mediator.Send(new ActivateContractCommand(id));
        return Ok(ApiResponse<ContractDto>.Ok(result, SuccessMessages.ACTIVATE_CONTRACT_SUCCESS));
    }

    [HttpPatch("{id}/terminate")]
    public async Task<IActionResult> TerminateContract(Guid id, [FromBody] TerminateContractCommand command)
    {
        command = command with { Id = id };
        var result = await Mediator.Send(command);
        return Ok(ApiResponse<ContractDto>.Ok(result, SuccessMessages.TERMINATE_CONTRACT_SUCCESS));
    }

    [HttpGet("{id}/tenants")]
    public async Task<IActionResult> GetContractTenants(Guid id)
    {
        var result = await Mediator.Send(new GetContractTenantsQuery(id));
        return Ok(ApiResponse<List<TenantInRoomDto>>.Ok(result));
    }
}
