using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Tro88.Application.Common.Constants;
using Tro88.Application.Common.Models;
using Tro88.Application.Features.AiAgent.Commands.CreateConversation;
using Tro88.Application.Features.AiAgent.Commands.DeleteConversation;
using Tro88.Application.Features.AiAgent.Commands.ExecuteAgentTask;
using Tro88.Application.Features.AiAgent.Commands.SendMessage;
using Tro88.Application.Features.AiAgent.DTOs;
using Tro88.Application.Features.AiAgent.Queries.GetAgentTask;
using Tro88.Application.Features.AiAgent.Queries.GetConversationById;
using Tro88.Application.Features.AiAgent.Queries.GetConversations;

namespace Tro88.API.Controllers;

[Authorize]
public class AiAgentController : BaseApiController
{
    [HttpPost("conversations")]
    public async Task<IActionResult> CreateConversation(
        [FromBody] CreateConversationCommand command)
    {
        var result = await Mediator.Send(command);
        return Ok(ApiResponse<ConversationDto>.Ok(
            result, SuccessMessages.CREATE_AI_CONVERSATION_SUCCESS));
    }

    [HttpGet("conversations")]
    public async Task<IActionResult> GetConversations(
        [FromQuery] GetConversationsQuery query)
    {
        var result = await Mediator.Send(query);
        return Ok(ApiResponse<List<ConversationDto>>.Ok(
            result.Items,
            metaData: new MetaData
            {
                Page = query.Page,
                PageSize = query.PageSize,
                Total = result.Total,
                TotalPage = result.TotalPage
            }));
    }

    [HttpGet("conversations/{id:guid}")]
    public async Task<IActionResult> GetConversation(Guid id)
    {
        var result = await Mediator.Send(new GetConversationByIdQuery(id));
        return Ok(ApiResponse<ConversationDto>.Ok(result));
    }

    [HttpPost("conversations/{id:guid}/messages")]
    public async Task<IActionResult> SendMessage(
        Guid id,
        [FromBody] SendMessageRequest request)
    {
        var result = await Mediator.Send(
            new SendMessageCommand(id, request.Content));
        return Ok(ApiResponse<AiMessageDto>.Ok(result));
    }

    [HttpGet("conversations/{id:guid}/messages")]
    public async Task<IActionResult> GetMessages(Guid id)
    {
        var result = await Mediator.Send(new GetConversationByIdQuery(id));
        return Ok(ApiResponse<List<AiMessageDto>>.Ok(
            result.Messages ?? []));
    }

    [HttpDelete("conversations/{id:guid}")]
    public async Task<IActionResult> DeleteConversation(Guid id)
    {
        await Mediator.Send(new DeleteConversationCommand(id));
        return Ok(ApiResponse<object>.Ok(
            null, SuccessMessages.DELETE_AI_CONVERSATION_SUCCESS));
    }

    [HttpPost("tasks")]
    public async Task<IActionResult> ExecuteTask(
        [FromBody] ExecuteAgentTaskCommand command)
    {
        var result = await Mediator.Send(command);
        return Ok(ApiResponse<AgentTaskDto>.Ok(result));
    }

    [HttpGet("tasks/{id:guid}")]
    public async Task<IActionResult> GetTask(Guid id)
    {
        var result = await Mediator.Send(new GetAgentTaskQuery(id));
        return Ok(ApiResponse<AgentTaskDto>.Ok(result));
    }
}

public record SendMessageRequest(string Content);
