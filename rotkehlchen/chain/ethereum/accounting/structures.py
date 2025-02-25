from enum import Enum
from typing import TYPE_CHECKING, List, Literal, NamedTuple, Optional, Protocol

from rotkehlchen.accounting.structures.base import HistoryBaseEntry

if TYPE_CHECKING:
    from rotkehlchen.accounting.pot import AccountingPot


class AccountantCallback(Protocol):
    """Type of a Submodule's accountant callback"""
    def __call__(
            self,
            pot: 'AccountingPot',
            event: 'HistoryBaseEntry',
            other_events: List['HistoryBaseEntry'],
    ) -> None:
        ...


class TxMultitakeTreatment(Enum):
    SWAP = 0


class TxEventSettings(NamedTuple):
    """Settings for an event generated by a decoder"""
    taxable: bool
    count_entire_amount_spend: bool
    count_cost_basis_pnl: bool
    take: int
    method: Literal['acquisition', 'spend']
    multitake_treatment: Optional[TxMultitakeTreatment] = None
    accountant_cb: Optional[AccountantCallback] = None
