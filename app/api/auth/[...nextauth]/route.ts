import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { supabaseAdmin } from '@/lib/supabaseClient'

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          // Check if user exists in our database
          const { data: existingUser, error: fetchError } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('email', user.email)
            .single()

          if (!existingUser) {
            // Create new user (let Supabase generate the UUID)
            const { data: newUser, error: insertError } = await supabaseAdmin
              .from('users')
              .insert({
                email: user.email!,
              })
              .select()
              .single()

            if (insertError) {
              console.error('Error creating user:', insertError)
              return false
            }

            if (!newUser) {
              console.error('Failed to create user: newUser is null')
              return false
            }

            // Create user profile
            const { error: profileError } = await supabaseAdmin
              .from('user_profiles')
              .insert({
                user_id: newUser.id,
                goals: [],
                preferences: {},
                routines: []
              })

            if (profileError) {
              console.error('Error creating user profile:', profileError)
              return false
            }
          }
        } catch (error) {
          console.error('Error in signIn callback:', error)
          return false
        }
      }
      return true
    },
    async session({ session, token }) {
      if (session.user?.email) {
        try {
          const { data: user } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('email', session.user.email)
            .single()

          if (user) {

            (session.user as any).id = user.id
          }
        } catch (error) {
          console.error('Error fetching user in session callback:', error)
        }
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
})

export { handler as GET, handler as POST }
