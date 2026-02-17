import { parseAsync, transforms } from "json2csv";
import { Readable, TransformOptions } from "stream";

type Json2CsvOptions = Record<string, unknown>;

type GenerateCSVParams<T> = {
  data: Readonly<T> | ReadonlyArray<T> | Readable;
  fields?: string[];
  transformFunction?: (item: T) => Record<string, unknown>;
  flattenObjects?: boolean;
  flattenArrays?: boolean;
  pathsToUnwind?: string[];
  opts?: Json2CsvOptions;
  transformOpts?: TransformOptions;
};

export const generateCSV = async <T>({
  data,
  fields,
  transformFunction,
  flattenObjects = false,
  flattenArrays = false,
  pathsToUnwind,
  opts,
  transformOpts,
}: GenerateCSVParams<T>): Promise<string> => {
  const transformations = [
    transforms.flatten({
      objects: flattenObjects,
      arrays: flattenArrays,
    }),
  ];
  if (transformFunction) {
    transformations.push(transformFunction);
  }
  if (pathsToUnwind) {
    transformations.push(transforms.unwind({ paths: pathsToUnwind }));
  }

  const options = {
    fields,
    transforms: transformations,
    ...opts,
  };
  return parseAsync(
    data as Readable,
    options as Json2CsvOptions,
    transformOpts as TransformOptions
  ) as Promise<string>;
};

export const downloadCSV = (data: string, fileName: string): void => {
  const byteOrderMark = "\uFEFF";
  const csvContent = byteOrderMark + data;
  const blob = new Blob([csvContent], {
    type: "text/csv, charset=UTF-8",
  });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(url);
  });
};
