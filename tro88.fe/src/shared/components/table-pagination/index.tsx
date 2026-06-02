import type { TableProps } from "antd";
import { Skeleton, Table } from "antd";
import type { ForwardedRef, MutableRefObject } from "react";
import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import { TableWrapper } from "./styled";

export interface ITableWithPagination<T = any> extends TableProps<T> {
  bodyHeight?: string | number;
  paginationBackground?: string;
  onRow?: any;
  hidePaginationTotal?: boolean;
  hidePageSizeChanger?: boolean;
}

const TableWithPagination = <T extends object = any>(
  {
    bodyHeight,
    paginationBackground,
    pagination,
    columns,
    dataSource,
    loading,
    hidePaginationTotal,
    hidePageSizeChanger,
    scroll,
    ...props
  }: ITableWithPagination<T>,
  ref: ForwardedRef<HTMLDivElement>
) => {
  const [_pageSize, setPageSize] = useState<number>(
    (pagination && typeof pagination === "object" && pagination.pageSize) || 10
  );

  const tableContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = tableContainerRef.current;
    if (!container) return;

    const cells = container.querySelectorAll<HTMLElement>(
      ".ant-table-thead th, .ant-table-tbody td, .ant-table-summary td"
    );

    cells.forEach((cell) => {
      if (cell.classList.contains("action-column")) return;

      cell.setAttribute("tabindex", "-1");
      cell
        .querySelectorAll<HTMLElement>(
          "a, button, input, select, textarea, [tabindex], .ant-skeleton-input"
        )
        .forEach((child) => child.setAttribute("tabindex", "-1"));
    });
  }, [dataSource, columns, loading]);

  const _dataSource = loading
    ? new Array(_pageSize).fill(null).map((_, index) => ({ key: index }) as T)
    : dataSource;

  const _columns = loading
    ? columns?.map((column) => ({
        ...column,
        render: () => (
          <Skeleton.Input
            size="small"
            active
            block
            style={{ pointerEvents: "none" }}
          />
        ),
      }))
    : columns;

  useEffect(() => {
    if (pagination && typeof pagination === "object" && pagination.pageSize !== undefined) {
      setPageSize(pagination.pageSize || 10);
    }
  }, [pagination]);

  const _scroll = useMemo(() => {
    if (!scroll) return undefined;
    if (!_dataSource || _dataSource.length === 0) {
      const { y, ...rest } = scroll;
      return Object.keys(rest).length > 0 ? rest : undefined;
    }
    return scroll;
  }, [scroll, _dataSource]);

  const mergedPagination =
    pagination === false
      ? false
      : {
          total:
            (pagination && typeof pagination === "object" && pagination.total) ||
            dataSource?.length,
          showSizeChanger: !hidePageSizeChanger,
          pageSize: _pageSize,
          showTotal: hidePaginationTotal
            ? undefined
            : (total: number, range: [number, number]) =>
                `${range[0]}- ${range[1]} trong số ${total}`,
          onShowSizeChange: (_: number, size: number) => setPageSize(size),
          ...(typeof pagination === "object" ? pagination : {}),
        };

  return (
    <TableWrapper
      ref={(node) => {
        tableContainerRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) {
          (ref as MutableRefObject<HTMLDivElement | null>).current = node;
        }
      }}
      paginationBackground={paginationBackground}
      $bodyHeight={bodyHeight}
    >
      <Table<T>
        loading={loading}
        columns={_columns}
        dataSource={_dataSource}
        pagination={mergedPagination}
        scroll={_scroll}
        {...props}
      />
    </TableWrapper>
  );
};

export default forwardRef<HTMLDivElement, ITableWithPagination>(
  TableWithPagination
);
