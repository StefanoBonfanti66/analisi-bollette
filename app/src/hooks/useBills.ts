import { useState, useEffect, useCallback, type SetStateAction } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import type { Bill } from '../types'

function toDB(bill: Bill, userId: string) {
  return {
    user_id: userId,
    type: bill.type,
    customer_name: bill.customerName,
    date: bill.date,
    period_label: bill.periodLabel,
    total_amount: bill.totalAmount,
    consumption: bill.consumption,
    unit_cost: bill.unitCost,
    fixed_costs: bill.fixedCosts,
    variable_costs: bill.variableCosts,
    tv_license_fee: bill.tvLicenseFee ?? 0,
    provider: bill.provider,
    pdf_name: bill.pdfName,
    tips: bill.tips ?? null,
  }
}

function fromDB(row: any): Bill {
  return {
    id: row.id,
    type: row.type,
    customerName: row.customer_name,
    date: row.date,
    periodLabel: row.period_label,
    totalAmount: Number(row.total_amount),
    consumption: Number(row.consumption),
    unitCost: Number(row.unit_cost),
    fixedCosts: Number(row.fixed_costs),
    variableCosts: Number(row.variable_costs),
    tvLicenseFee: row.tv_license_fee ? Number(row.tv_license_fee) : undefined,
    provider: row.provider,
    pdfName: row.pdf_name ?? '',
    tips: row.tips ?? [],
  }
}

export function useBills() {
  const { user } = useAuth()
  const [bills, setBills] = useState<Bill[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    supabase
      .from('bills')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) {
          setBills(data.map(fromDB))
        }
        setLoading(false)
      })
  }, [user])

  const addBill = useCallback(async (bill: Bill) => {
    if (!user) return false

    const { data, error } = await supabase
      .from('bills')
      .insert(toDB(bill, user.id))
      .select()
      .single()

    if (!error && data) {
      setBills(prev => [fromDB(data), ...prev])
      return true
    }
    console.error('Error saving bill:', error)
    return false
  }, [user])

  const deleteBill = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('bills')
      .delete()
      .eq('id', id)

    if (!error) {
      setBills(prev => prev.filter(b => b.id !== id))
      return true
    }
    console.error('Error deleting bill:', error)
    return false
  }, [])

  const setBillsBulk = useCallback((value: SetStateAction<Bill[]>) => {
    setBills(value)
  }, [])

  return { bills, loading, addBill, deleteBill, setBills: setBillsBulk }
}
