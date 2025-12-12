import Link from "next/link"
import { Building2 } from "lucide-react"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-card/90 backdrop-blur-md border border-border/50 rounded-lg shadow-2xl p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2 mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 rounded-full bg-primary">
                <Building2 className="h-8 w-8 text-white stroke-1" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-foreground">Política de Privacidade</h1>
            <p className="text-muted-foreground">Gabi - Síndica Virtual</p>
          </div>

          {/* Conteúdo */}
          <div className="prose prose-invert max-w-none space-y-6 text-foreground">
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">1. Introdução</h2>
              <p className="text-foreground leading-relaxed">
                Esta Política de Privacidade descreve como o Condomínio Villa Dei Fiori coleta, usa e protege 
                suas informações pessoais quando você usa o sistema Gabi - Síndica Virtual.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">2. Informações Coletadas</h2>
              <p className="text-foreground leading-relaxed mb-3">
                Coletamos as seguintes informações quando você se cadastra e usa o sistema:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 text-foreground">
                <li>Nome completo</li>
                <li>Endereço de e-mail</li>
                <li>Tipo de usuário (síndico, morador, conselheiro, etc.)</li>
                <li>Informações de uso do sistema</li>
                <li>Dados de autenticação e sessão</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">3. Como Usamos Suas Informações</h2>
              <p className="text-foreground leading-relaxed mb-3">
                Utilizamos suas informações para:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 text-foreground">
                <li>Fornecer e manter o sistema</li>
                <li>Autenticar e autorizar seu acesso</li>
                <li>Gerenciar processos e aprovações condominiais</li>
                <li>Comunicar informações relevantes sobre o condomínio</li>
                <li>Melhorar a segurança e funcionalidade do sistema</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">4. Compartilhamento de Informações</h2>
              <p className="text-foreground leading-relaxed">
                Não compartilhamos suas informações pessoais com terceiros, exceto quando necessário para:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 text-foreground mt-3">
                <li>Cumprir obrigações legais</li>
                <li>Proteger os direitos e segurança do condomínio</li>
                <li>Fornecer serviços essenciais do sistema (provedores de infraestrutura)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">5. Segurança dos Dados</h2>
              <p className="text-foreground leading-relaxed">
                Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações pessoais 
                contra acesso não autorizado, alteração, divulgação ou destruição. Isso inclui criptografia, 
                controles de acesso e monitoramento regular.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">6. Retenção de Dados</h2>
              <p className="text-foreground leading-relaxed">
                Mantemos suas informações pessoais apenas pelo tempo necessário para cumprir os propósitos descritos 
                nesta política, a menos que um período de retenção mais longo seja exigido ou permitido por lei.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">7. Seus Direitos</h2>
              <p className="text-foreground leading-relaxed mb-3">
                Você tem o direito de:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 text-foreground">
                <li>Acessar suas informações pessoais</li>
                <li>Corrigir informações incorretas ou incompletas</li>
                <li>Solicitar a exclusão de suas informações (sujeito a obrigações legais)</li>
                <li>Retirar seu consentimento para processamento de dados</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">8. Cookies e Tecnologias Similares</h2>
              <p className="text-foreground leading-relaxed">
                O sistema utiliza cookies e tecnologias similares para manter sua sessão ativa e melhorar sua experiência. 
                Você pode configurar seu navegador para recusar cookies, mas isso pode afetar a funcionalidade do sistema.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">9. Alterações nesta Política</h2>
              <p className="text-foreground leading-relaxed">
                Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos você sobre mudanças 
                significativas publicando a nova política nesta página e atualizando a data de "Última atualização".
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">10. Contato</h2>
              <p className="text-foreground leading-relaxed">
                Se você tiver dúvidas sobre esta Política de Privacidade ou sobre como tratamos suas informações pessoais, 
                entre em contato com a administração do condomínio.
              </p>
            </section>

            <div className="pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Última atualização: {new Date().toLocaleDateString("pt-BR")}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-6 text-center">
            <Link 
              href="/login" 
              className="text-primary hover:underline text-sm"
            >
              Voltar para o login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
