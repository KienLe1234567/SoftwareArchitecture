namespace Shared.Exceptions;

public class NotFoundException : DomainException
{
    public NotFoundException(string message) : base(message)
    {
    }

    public NotFoundException(string resourceType, string identifier) 
        : base($"{resourceType} with identifier {identifier} was not found")
    {
    }
}