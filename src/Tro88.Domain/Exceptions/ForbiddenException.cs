namespace Tro88.Domain.Exceptions;

public class ForbiddenException : DomainException
{
    public ForbiddenException(string message = "Access denied")
        : base(message) { }
}