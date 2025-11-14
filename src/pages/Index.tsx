import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface Match {
  id: number;
  homeTeam: string;
  awayTeam: string;
  date: string;
  time: string;
  odds: {
    home: number;
    draw: number;
    away: number;
  };
  status: 'upcoming' | 'live' | 'finished';
}

interface Bet {
  matchId: number;
  team: string;
  outcome: 'home' | 'draw' | 'away';
  odds: number;
  amount: number;
}

const matches: Match[] = [
  {
    id: 1,
    homeTeam: 'Спартак',
    awayTeam: 'Динамо',
    date: '15 ноября',
    time: '19:00',
    odds: { home: 2.1, draw: 3.2, away: 3.5 },
    status: 'live'
  },
  {
    id: 2,
    homeTeam: 'Зенит',
    awayTeam: 'ЦСКА',
    date: '15 ноября',
    time: '21:30',
    odds: { home: 1.8, draw: 3.4, away: 4.2 },
    status: 'upcoming'
  },
  {
    id: 3,
    homeTeam: 'Локомотив',
    awayTeam: 'Краснодар',
    date: '16 ноября',
    time: '16:00',
    odds: { home: 2.3, draw: 3.1, away: 3.0 },
    status: 'upcoming'
  },
  {
    id: 4,
    homeTeam: 'Рубин',
    awayTeam: 'Ростов',
    date: '16 ноября',
    time: '18:30',
    odds: { home: 2.5, draw: 3.0, away: 2.8 },
    status: 'upcoming'
  }
];

export default function Index() {
  const [balance, setBalance] = useState(10000);
  const [bets, setBets] = useState<Bet[]>([]);
  const [selectedBets, setSelectedBets] = useState<{ [key: number]: 'home' | 'draw' | 'away' | null }>({});
  const [betAmounts, setBetAmounts] = useState<{ [key: number]: number }>({});

  const handleBetSelect = (matchId: number, outcome: 'home' | 'draw' | 'away') => {
    setSelectedBets(prev => ({
      ...prev,
      [matchId]: prev[matchId] === outcome ? null : outcome
    }));
    
    if (!betAmounts[matchId]) {
      setBetAmounts(prev => ({ ...prev, [matchId]: 100 }));
    }
  };

  const placeBet = (match: Match) => {
    const selected = selectedBets[match.id];
    const amount = betAmounts[match.id] || 100;
    
    if (!selected) {
      toast.error('Выберите исход матча');
      return;
    }
    
    if (amount > balance) {
      toast.error('Недостаточно средств');
      return;
    }
    
    const odds = selected === 'home' ? match.odds.home : 
                 selected === 'draw' ? match.odds.draw : match.odds.away;
    
    const teamName = selected === 'home' ? match.homeTeam : 
                     selected === 'draw' ? 'Ничья' : match.awayTeam;
    
    const newBet: Bet = {
      matchId: match.id,
      team: teamName,
      outcome: selected,
      odds: odds,
      amount: amount
    };
    
    setBets(prev => [...prev, newBet]);
    setBalance(prev => prev - amount);
    setSelectedBets(prev => ({ ...prev, [match.id]: null }));
    setBetAmounts(prev => ({ ...prev, [match.id]: 100 }));
    
    toast.success(`Ставка принята! ${teamName} × ${odds}`, {
      description: `Сумма: ${amount} ₽ | Возможный выигрыш: ${(amount * odds).toFixed(0)} ₽`
    });
  };

  const totalBetAmount = bets.reduce((sum, bet) => sum + bet.amount, 0);
  const potentialWin = bets.reduce((sum, bet) => sum + (bet.amount * bet.odds), 0);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-heading font-bold text-primary flex items-center gap-2">
              <Icon name="Trophy" size={32} className="text-secondary" />
              БЕТ-ЛСП
            </h1>
            <div className="flex items-center gap-4">
              <Card className="bg-primary/10 border-primary/20">
                <CardContent className="p-3 flex items-center gap-2">
                  <Icon name="Wallet" size={20} className="text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Баланс</p>
                    <p className="text-lg font-bold text-foreground">{balance.toLocaleString()} ₽</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2 mb-6">
              <Icon name="Calendar" size={24} className="text-primary" />
              <h2 className="text-2xl font-heading font-bold">Матчи турнира</h2>
            </div>

            {matches.map((match, index) => (
              <Card 
                key={match.id} 
                className="overflow-hidden hover:shadow-lg transition-all duration-300 border-border/50 animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon name="Trophy" size={20} className="text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{match.date} • {match.time}</span>
                    </div>
                    {match.status === 'live' && (
                      <Badge variant="destructive" className="animate-pulse-green">
                        <Icon name="Radio" size={14} className="mr-1" />
                        LIVE
                      </Badge>
                    )}
                    {match.status === 'upcoming' && (
                      <Badge variant="secondary">
                        Скоро
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 items-center">
                    <div className="text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                          <Icon name="Shield" size={24} className="text-primary" />
                        </div>
                        <p className="font-heading font-semibold text-lg">{match.homeTeam}</p>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-4xl font-heading font-bold text-muted-foreground">VS</p>
                    </div>
                    <div className="text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center">
                          <Icon name="Shield" size={24} className="text-secondary" />
                        </div>
                        <p className="font-heading font-semibold text-lg">{match.awayTeam}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant={selectedBets[match.id] === 'home' ? 'default' : 'outline'}
                      className="flex flex-col h-auto py-3 transition-all hover:scale-105"
                      onClick={() => handleBetSelect(match.id, 'home')}
                    >
                      <span className="text-xs text-muted-foreground mb-1">П1</span>
                      <span className="text-xl font-bold">{match.odds.home}</span>
                    </Button>
                    <Button
                      variant={selectedBets[match.id] === 'draw' ? 'default' : 'outline'}
                      className="flex flex-col h-auto py-3 transition-all hover:scale-105"
                      onClick={() => handleBetSelect(match.id, 'draw')}
                    >
                      <span className="text-xs text-muted-foreground mb-1">X</span>
                      <span className="text-xl font-bold">{match.odds.draw}</span>
                    </Button>
                    <Button
                      variant={selectedBets[match.id] === 'away' ? 'default' : 'outline'}
                      className="flex flex-col h-auto py-3 transition-all hover:scale-105"
                      onClick={() => handleBetSelect(match.id, 'away')}
                    >
                      <span className="text-xs text-muted-foreground mb-1">П2</span>
                      <span className="text-xl font-bold">{match.odds.away}</span>
                    </Button>
                  </div>

                  {selectedBets[match.id] && (
                    <div className="space-y-3 p-4 bg-muted/30 rounded-lg border border-primary/20 animate-slide-up">
                      <div className="flex items-center gap-2">
                        <Icon name="Coins" size={18} className="text-primary" />
                        <label className="text-sm font-medium">Сумма ставки</label>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min="10"
                          max={balance}
                          value={betAmounts[match.id] || 100}
                          onChange={(e) => setBetAmounts(prev => ({ ...prev, [match.id]: Number(e.target.value) }))}
                          className="flex-1 px-3 py-2 bg-background border border-input rounded-md text-foreground"
                        />
                        <Button 
                          onClick={() => placeBet(match)}
                          className="bg-primary hover:bg-primary/90"
                        >
                          <Icon name="Check" size={18} className="mr-2" />
                          Поставить
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Возможный выигрыш: <span className="text-primary font-bold">
                          {((betAmounts[match.id] || 100) * (
                            selectedBets[match.id] === 'home' ? match.odds.home :
                            selectedBets[match.id] === 'draw' ? match.odds.draw :
                            match.odds.away
                          )).toFixed(0)} ₽
                        </span>
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="space-y-4">
            <Card className="sticky top-24 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="ClipboardList" size={24} className="text-primary" />
                  Мои ставки
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {bets.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Icon name="Inbox" size={48} className="mx-auto mb-2 opacity-50" />
                    <p>Ставок пока нет</p>
                  </div>
                ) : (
                  <>
                    {bets.map((bet, index) => (
                      <div key={index} className="p-3 bg-muted/50 rounded-lg border border-border space-y-1">
                        <div className="flex justify-between items-start">
                          <p className="font-medium text-sm">{bet.team}</p>
                          <Badge variant="outline" className="text-xs">
                            {bet.odds}
                          </Badge>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Ставка: {bet.amount} ₽</span>
                          <span className="text-primary font-medium">
                            +{(bet.amount * bet.odds - bet.amount).toFixed(0)} ₽
                          </span>
                        </div>
                      </div>
                    ))}
                    
                    <div className="pt-4 border-t border-border space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Всего ставок:</span>
                        <span className="font-bold">{totalBetAmount} ₽</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Потенциальный выигрыш:</span>
                        <span className="font-bold text-primary">{potentialWin.toFixed(0)} ₽</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Возможная прибыль:</span>
                        <span className="font-bold text-secondary">+{(potentialWin - totalBetAmount).toFixed(0)} ₽</span>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
