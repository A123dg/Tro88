namespace Tro88.Domain.Exceptions;

public class NotFoundException : DomainException
{
    public NotFoundException(string message)
        : base(message) { }

    public NotFoundException(string entityName, Guid id)
        : base($"{entityName}: {id}") { }
}
