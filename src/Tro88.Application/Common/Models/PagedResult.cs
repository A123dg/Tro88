namespace Tro88.Application.Common.Models;

public class PagedResult<T>
{
    public List<T> Items { get; set; } = [];
    public int Total { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPage { get; set; }

    public PagedResult()
    {
    }

    public PagedResult(IEnumerable<T> items, int total, int page, int pageSize)
    {
        Items = items.ToList();
        Total = total;
        Page = page;
        PageSize = pageSize;
        TotalPage = CalculateTotalPage(total, pageSize);
    }

    public static int CalculateTotalPage(int total, int pageSize)
        => pageSize <= 0 ? 0 : (int)Math.Ceiling(total / (double)pageSize);
}
