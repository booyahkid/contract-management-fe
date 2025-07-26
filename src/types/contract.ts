export interface Contract {
  id: number
  contract_type: string
  contract_number: string
  contract_name: string
  category: string
  sub_category?: string
  item?: string
  contract_date: string
  start_date: string
  end_date: string
  ats_amount: number
  jsl_amount: number
  subscription_amount: number
  notes: string
  department: string
  pic_user_name: string
  pic_ipm_name: string
  vendor: string
  created_at?: string
  updated_at?: string
}

export interface NewContract {
  contract_type: string
  contract_number: string
  contract_name: string
  category: string
  sub_category?: string
  item?: string
  contract_date: string
  start_date: string
  end_date: string
  ats_amount: number
  jsl_amount: number
  subscription_amount: number
  notes: string
  department: string
  vendor: string
}



