import { supabase } from './supabase'

export type ReliefDistributionRecord = {
  id: number
  beneficiary_name: string
  distribution_date: string
  claim_status: string
  amount?: number
}

export async function fetchReliefDistributions() {
  const { data, error } = await supabase
    .from('relief_distributions')
    .select('id, beneficiary_name, distribution_date, claim_status, amount')
    .order('distribution_date', { ascending: false })

  return { data, error }
}
