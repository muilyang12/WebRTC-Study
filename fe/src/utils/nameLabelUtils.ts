export function createNameLabel() {
  const mark = document.createElement("div");

  mark.style.fontSize = "20px";
  mark.style.position = "absolute";
  mark.style.top = `-20px`;
  mark.style.left = `-20px`;
  mark.style.width = "30px";
  mark.style.height = "30px";
  mark.style.textAlign = "center";
  mark.style.border = "1px solid black";

  return mark;
}

export function updateNameLabel(mark: HTMLDivElement, userName: string, x: number, y: number) {
  mark.innerHTML = userName;
  mark.style.top = `${y}px`;
  mark.style.left = `${x}px`;

  return mark;
}
