export interface Plan {
    name: string
    range: string
    bonus: string
    minAmount: number
    duration: string
    color: string
  }
  
  export const PLANS: Plan[] = [
    {
      name: 'Starter Plan',
      range: '$5,000 - $49,500',
      bonus: '950% Gift Bonus: $10',
      minAmount: 5000,
      duration: '1 month',
      color: 'border-blue-200 bg-blue-50 hover:bg-blue-100'
    },
     {
        name: 'Premium Plan',
        range: '$25,000 - $65,000',
        bonus: '2500% Gift Bonus: $200',
        minAmount: 25000,
        duration: '1 month',
        color: 'border-purple-200 bg-purple-50 hover:bg-purple-100'
      },
      {
        name: 'Trade Plan', 
        range: '$40,000 - $75,000',
        bonus: '4000% Gift Bonus: $500',
        minAmount: 40000,
        duration: '1 month',
        color: 'border-emerald-200 bg-emerald-50 hover:bg-emerald-100'
      }
  ]