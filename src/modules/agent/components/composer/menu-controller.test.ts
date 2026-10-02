// src/modules/agent/components/composer/menu-controller.test.ts
import { describe, expect, it, vi } from "vitest";
import { MenuController, type MenuItem } from "./menu-controller";

const choice = (value: string): MenuItem => ({ kind: "choice", value });
const notice: MenuItem = { kind: "notice", text: "Sin resultados" };

describe("MenuController", () => {
  it("opens on the first selectable item and moves with the arrows, wrapping", () => {
    const menu = new MenuController();
    menu.open("Opciones", [notice, choice("a"), choice("b")], vi.fn());
    expect(menu.getSnapshot()?.selected).toBe(1);
    menu.handleKey("ArrowDown");
    expect(menu.getSnapshot()?.selected).toBe(2);
    menu.handleKey("ArrowDown");
    expect(menu.getSnapshot()?.selected).toBe(1);
    menu.handleKey("ArrowUp");
    expect(menu.getSnapshot()?.selected).toBe(2);
  });

  it("chooses the selected item with Enter or Tab", () => {
    const choose = vi.fn();
    const menu = new MenuController();
    menu.open("Opciones", [choice("a"), choice("b")], choose);
    menu.handleKey("ArrowDown");
    expect(menu.handleKey("Enter")).toBe(true);
    expect(choose).toHaveBeenCalledWith(choice("b"));
  });

  it("swallows Enter when only notices are shown, so the message is not sent", () => {
    const choose = vi.fn();
    const menu = new MenuController();
    menu.open("Clientes", [notice], choose);
    expect(menu.handleKey("Enter")).toBe(true);
    expect(choose).not.toHaveBeenCalled();
  });

  it("closes with Escape and then lets keys through", () => {
    const menu = new MenuController();
    menu.open("Opciones", [choice("a")], vi.fn());
    expect(menu.handleKey("Escape")).toBe(true);
    expect(menu.getSnapshot()).toBeNull();
    expect(menu.handleKey("Enter")).toBe(false);
  });

  it("notifies subscribers", () => {
    const menu = new MenuController();
    const listener = vi.fn();
    menu.subscribe(listener);
    menu.open("x", [choice("a")], vi.fn());
    menu.close();
    expect(listener).toHaveBeenCalledTimes(2);
  });
});
