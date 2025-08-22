"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { useRouter, useSearchParams } from "next/navigation"

export default function PhoneVerificationForm() {
  const [phoneNo, setPhoneNo] = useState("")
  const [role, setRole] = useState<"student" | "staff">("student")
  // Backend expects DayOrHos to be either "hostel" or "DayScoller" (note spelling)
  const [dayOrHos, setDayOrHos] = useState<"hostel" | "DayScoller">("hostel")
  const [studentId, setStudentId] = useState("")
  const [empId, setEmpId] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { updateUser } = useAuth()

  const validateForm = () => {
    const errors: Record<string, string> = {}
    
    if (!phoneNo || !/^\d{10}$/.test(phoneNo)) {
      errors.phoneNo = "Please enter a 10-digit phone number"
    }
    
    if (role === "student" && !studentId) {
      errors.studentId = "Student ID is required"
    }
    
    if (role === "staff" && !empId) {
      errors.empId = "Employee ID is required"
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      console.log("Form validation failed:", formErrors)
      return
    }
    
    setIsLoading(true)
    console.log("Submitting user profile data...")
    
    try {
      // Get token from localStorage
      const token = localStorage.getItem("auth_token")
      
      if (!token) {
        console.error("No auth token found when submitting form")
        toast({
          title: "Authentication Error",
          description: "You're not logged in. Please log in and try again.",
          variant: "destructive",
        })
        router.push("/login")
        return
      }
      
      // Create payload based on role
      // Normalize any legacy 'day' value to backend-expected 'DayScoller'
      const normalizedDayOrHos = (dayOrHos as any) === "day" ? "DayScoller" : dayOrHos
      const payload = {
        phoneNo,
        role,
        DayOrHos: normalizedDayOrHos,
        ...(role === "student" ? { studentId } : { EmpId: empId }),
      }
      
      console.log("Submitting payload:", payload)
      
      // Send data to external API exactly like the provided curl
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/User/auth/fill-user-data`, {
        method: "POST",
        headers: {
          // Raw token, no "Bearer " prefix
          Authorization: token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...payload,
          // Ensure phoneNo is numeric as in the curl example
          phoneNo: Number(phoneNo),
        }),
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error(`API error (${response.status}):`, errorText)
        let errorMessage = "Failed to submit user data"
        
        try {
          const errorData = JSON.parse(errorText)
          errorMessage = errorData.message || errorMessage
        } catch (e) {
          // If parsing fails, use the error text as is
          errorMessage = errorText || errorMessage
        }
        
        throw new Error(errorMessage)
      }
      
      const data = await response.json()
      console.log("Profile update success:", data)
      
      // Show success message
      toast({
        title: "Success",
        description: "Your information has been saved successfully!",
      })
      
      // Update user in context if needed
      // Since phoneNo isn't in the User type, we don't update it directly
      updateUser({ 
        // We could update other user properties here if needed
      })
      
  // Redirect back to original page if provided
  const returnTo = searchParams?.get("returnTo") || "/"
  router.push(returnTo)
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container flex min-h-screen flex-col items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Complete Your Profile</CardTitle>
          <CardDescription>Please provide the following information to complete your account setup</CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter your phone number"
                value={phoneNo}
                onChange={(e) => setPhoneNo(e.target.value)}
              />
              {formErrors.phoneNo && (
                <p className="text-sm text-destructive">{formErrors.phoneNo}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label>Role</Label>
              <RadioGroup 
                value={role} 
                onValueChange={(value) => setRole(value as "student" | "staff")}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="student" id="role-student" />
                  <Label htmlFor="role-student">Student</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="staff" id="role-staff" />
                  <Label htmlFor="role-staff">Staff</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-2">
              <Label>Day Scholar or Hosteller</Label>
              <RadioGroup 
                value={dayOrHos} 
                onValueChange={(value) => setDayOrHos(value as "hostel" | "DayScoller")}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  {/* Backend spelling: DayScoller */}
                  <RadioGroupItem value="DayScoller" id="day-scholar" />
                  <Label htmlFor="day-scholar">Day Scholar</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="hostel" id="hosteller" />
                  <Label htmlFor="hosteller">Hosteller</Label>
                </div>
              </RadioGroup>
            </div>
            
            {role === "student" && (
              <div className="space-y-2">
                <Label htmlFor="studentId">Student ID</Label>
                <Input
                  id="studentId"
                  placeholder="Enter your student ID"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                />
                {formErrors.studentId && (
                  <p className="text-sm text-destructive">{formErrors.studentId}</p>
                )}
              </div>
            )}
            
            {role === "staff" && (
              <div className="space-y-2">
                <Label htmlFor="empId">Employee ID</Label>
                <Input
                  id="empId"
                  placeholder="Enter your employee ID"
                  value={empId}
                  onChange={(e) => setEmpId(e.target.value)}
                />
                {formErrors.empId && (
                  <p className="text-sm text-destructive">{formErrors.empId}</p>
                )}
              </div>
            )}
          </CardContent>
          
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Submitting..." : "Save Information"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
