import {
  GameBoardItemType,
  GameDirection,
  GameDirectionMap,
  GameDirectionToKeys,
  pillMax,
} from '../Map';
import Item from './Item';

class Pacman extends Item implements GameBoardItem {
  type: GameBoardItemType = GameBoardItemType.PACMAN;

  desiredMove: string | false = false;

  score: number = 0;

  /**
   * Returns the next move
   */
  getNextMove(): GameBoardItemMove | boolean {
    const { moves } = this.piece;
    let move: GameBoardItemMove | false = false;

    // If there is a keyboard move, use it and clear it
    if (this.desiredMove) {
      if (moves[this.desiredMove]) {
        move = {
          piece: moves[this.desiredMove],
          direction: GameDirectionMap[this.desiredMove],
        };
        this.desiredMove = false;
      }
    }

    // Otherwise, continue in the last direction
    if (!move && this.direction !== GameDirection.NONE) {
      const key = GameDirectionToKeys(this.direction);
      if (moves[key]) {
        move = { piece: moves[key], direction: this.direction };
      }
    }

    return move;
  }

  /**
   * Move Pacman and "eat" the item
   */
  move(piece: GameBoardPiece, direction: GameDirection): void {
    const item = this.items[piece.y][piece.x];
    if (typeof item !== 'undefined') {
      this.score += item.type;
      switch (item.type) {
        case GameBoardItemType.PILL:
          this.pillTimer.timer = pillMax;
          break;
        case GameBoardItemType.GHOST:
          if (typeof item.gotoTimeout !== 'undefined') item.gotoTimeout();
          break;
        default:
          break;
      }
    }
    this.setBackgroundItem({ type: GameBoardItemType.EMPTY });
    this.fillBackgroundItem();

    this.setPiece(piece, direction);
    this.items[piece.y][piece.x] = this;
  }
}

export default Pacman;
