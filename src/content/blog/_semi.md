Original report can be found [here](/semiprime_orig.pdf)

## Introduction

Adiabatic Quantum Computation (AQC), also known as Quantum Annealing, is a computational model that uses quantum mechanics to find the lowest energy state of a cost Hamiltonian.[^farhi] This model is used by D-Wave quantum computers and has been shown to be equivalent to the gate-circuit model used by IBM-Q computers.[^mizel]

AQC is similar to a group of classical algorithms called Simulated Annealing (SA), which use statistical mechanics to solve optimization problems and other combinatorial search problems. AQC generally performs better than SA, taking less time to complete and being more accurate in edge cases (taking the help of quantum tunneling to escape out of local optimal solutions). One key di↵erence between SA and AQC is that SA uses temperature as a control parameter to find the optimal configuration when temperature reaches zero, while the system in AQC is always close to the instantaneous ground state.

AQC started as an approach to solving optimization problems and has evolved into an important universal alternative to the standard circuit model of quantum computing, with deep connections to both classical and quantum complexity theory and condensed matter physics. The time complexity for an adiabatic algorithm is dependent on the gap in the energy eigenvalues (spectral gap) of the Hamiltonian.

In this project we will implement an AQC algorithm for semiprime factorization problem and attempt to figure out the time complexity of it.

### Semiprime Factorization Problem

A semiprime number is a composite number that can be written as a product of exactly two prime numbers. These factors may be equal to each other. Semiprime numbers are used extensively in cryptography. These systems rely on the fact that finding large prime numbers and multiplying them is easy but finding the factor from the semiprime number is hard.

It is in fact intractable, which means that the time required to factorize a number is necessarily exponential in it’s length, or in other words has exponential time complexity. Semi-prime factorization is an increasingly important number theoretic problem, since it is computationally intractable. Further, this property has been applied in public-key cryptography, such as the Rivest–Shamir–Adleman (RSA) cryptosystem for secure digital communications.

Overall, semiprime numbers remain an active area of research with implications to cryptography and number theory.

## Overall Process

The overall process of finding the factors of a number $N$ of length $b_n$ can be understood using

 <!-- TODO: Flowchart  -->

Starting with our number $N$, we choose our guess $b_P$, $b_Q$ such that

$$
  b_N = b_P + p_Q \text{ or } b_P +b_Q +1
$$

We will need to loop over all possible guesses. We start by generating clauses based on our initial guess. Then, we apply variable reduction rules to make the clauses as information-dense as possible. If the rules return an error due to impossible clauses, we reject this iteration of our guess and start over with a new one.

At this point, we have completed the classical preprocessing part of our method. We use the reduced forms of clauses to build Hamiltonians that assign the lowest energy to states encoding our solution. These Hamiltonians are used to create our problem Hamiltonian.

Next, we use Adiabatic Quantum Computation (AQC) to find the ground state of the problem Hamiltonian. After repeated measurements, this will provide us with a state that minimizes the number of broken clauses. We can then check if we have arrived at our factors $p$ and $q$ by simply multiplying them. If the multiplication does not result in a value equal to $N$, we must proceed with our next guess.

We repeat these steps until we arrive at our required factors. We would have at most $\left\lfloor (b_N+1)/2 \right\rfloor$ guesses, which would not make this method inefficient.

In the following sections, we will examine each step outlined in greater detail.

### Classical Preprocessing

Classical preprocessing refers to the steps required to construct as well as
minimize the computational complexity of the clauses required.

#### Cost Function

In order to convert the semiprime factorization problem to an optimization problem, we must construct a function over our binary variables

$$
  C:\{0,1\}^m \to \R
$$

such that the combination of inputs encoding our solution would have the lowest cost assigned.
In the first AQC implementation for factorization, where the number 21 was factored[^peng], a very straightforward way to construct such a function was given

$$
  C=[N - P \times Q]^2
$$

where,

$$
  P=\sum_{k=0}^{b_p-1} 2^k p_k
$$

$$
  Q=\sum_{k=0}^{b_q-1} 2^k q_k
$$

are the binary expansions of $P$ and $Q$ using binary variables. It’s easy to see that for the correct factors, the cost would be zero. This method however doesn’t scale well as the spectrum-width scales as $N^2$ (cost corresponding with $p=q=0$).

<!-- TODO: Fig 2 -->

Another method to construct the cost function used long hand multiplication tables[^ralf]. In this case we build a multiplication table like the one for 143 in Figure 2. Then, for each column we can define a cost function. For column $b_2$, the variables must satisfy

$$
  p_{2}+p_{1}q_{1}+q_{2}+z_{12}=1+2z_{23}+4z_{24}
$$

which would give us the cost function

$$
  C_{2}=(p_{2}+p_{1}q_{1}+z_{12}-1-2z_{23}-4z_{24})^2
$$

The complete cost function would be the sum of the costs associated with each column.

$$
  C=\sum_{k} C_k
$$

#### Rule-based variable reduction

This method not only controls the spectrum-width but also enables us to use classical preprocessing through logical deductions to reduce the number of variables needed to factor a given number[^xu]. This reduction could even make the number of variables less than the size of the problem $b_N$ . To achieve this, we need to find a set of rule-templates that can be tested on our set of equations in polynomial time and apply suitable substitutions. I have identified an (incomplete) set of rules, given in Table 1

 <!-- TODO: table 1 -->

Using a python script, a sample output for a small number is given below

<!-- TODO: output -->

These rules are able to eliminate most of the variables, reducing the complexity of the problem considerably.

Semiprimes generated by the multiplication of the first 1000 primes were tested. Figure 3 shows us the scaling law of the same.

<!-- TODO: Fig 3 -->

#### Limit testing of the rule-based approach

As there is no generalization of the rules nor is there a complete set of rules provided somewhere, various efforts to reduce the number of variables into the sub-$b_N$ regime have been tried in hopes of reducing the complexity to make it possible to factor a large semiprime with the hardware and technology available presently. For example, in a 2021 article[^amir], Figure 4 was reported.

<!-- TODO: fig4 -->

For example take the final equation that was left after optimization of 143.

$$
  A+B=2AB+1
$$

we could in this case set $B = \neg A$ and completely remove all variables from the problem, in which case the classical preprocessing was able to give us the factors of the number without even needing to go to the AQC part.

But unable to generalize the equations, I took a different approach to test the limits to which this preprocessing idea could be taken. To see how this approach works, lets take a simple rule from the table

$$
  A+B=2X
$$

or the cost function

$$
  C=(A+B-2X)^2
$$

Lets make a table with all the possible inputs and their associated cost.

<!-- WARN: Missing table -->

It can be seen from the table that the zero cost corresponds with equating the variables with each other

$$
  A=B=X
$$

which results in the recution of two variables.

A similar approach is taken for any equation encountered. For example take the equation

$$
  A+B=2C+1
$$

and its associated cost function

$$
  C=(A+B-2C-1)^2
$$

We can then create a table with all the combinations of inputs and costs, which in this case would be

<!-- WARN: Missing table -->

We can then filter out all the combinations that do not satisfy the clause, which leaves us with only two combinations.

Noticing that $C$ is always zero, we can completely remove this variable from all the equations. Also as $A + B = 1$, we can set $B=\neg A$ and replace $B$ everywhere as well. The value of $B$ can be recovered after the completion of AQC, its value being linked to the value of the variable $A$. Thus, we have reduced the number of variables required by 2.

When $B$ is replaced, it is replaced wherever it occurs in any of the clauses for a semiprime. Doing so starts a domino reaction with the substitution causing changes to other equations that could then be retried with the possibility of more variables being reduced.

It is not necessary for all the variables involved to be reduced in such a way, for example in the case of $A+2B+4C=D+E$, in which case the only reduction that can be made would be to set $C$ to zero.

We have not considered substitutions of variables for testing as that would completely reduce all the variables.

This method is not ecient, and in fact itself a satisfiability problem. This method wouldn’t be a part of our rule based variable reduction, and has only been introduced to check the limits to which the classical processing could reduce the problem.

Using a Rust program, the generated semiprimes were tested again.

<!-- WARN: Missing Figure -->

It can be seen from the boxplot that the simple rules introduced before was able to take us very close to the limit. But it also shows that this method cannot be used to take make the variables less than $b_N$ . It is technically possible to remove any of the carries left in the end as they always occur in pairs, but doing so would increase the spectrum-width that we were trying to control in the first place.

Any similar approach that reduces the spectrum-width would also face the same downfall. For example, we could have tried to take non-binary variables for the carries that would only occur between columns that are next to each other in the multiplication table (carry aggregation)[^soham], but that seems to be an even looser condition as all it cares about are the upper and lower limits.

### Adiabatic Quantum Computing

#### Mathematics of AQC

AQC works due to the Adiabatic Theorem that states that a system evolving due to a time varying hamiltonian $\hat{H}(t)$, which doesn’t have a degenerate ground state (except possibly as $t \to \tau$ ), would stay in the instantaneous groundstate $\left | 0(t) \right >$ in the absence of external disturbances if it starts in the groundstate $\left | 0(0) \right >$, provided that the hamiltonian changes suciently slowly.[^max][^morita]

[^farhi]: Edward Farhi, Jerey Goldstone, Sam Gutmann, Joshua Lapan, Andrew Lundgren, and Daniel Preda. A quantum adiabatic evolution algorithm applied to random instances of an np-complete problem. _Science_, 292(5516):472–475, 2001

[^mizel]: Ari Mizel, Daniel A Lidar, and Morgan Mitchell. Simple proof of equivalence between adiabatic quantum computation and the circuit model. _Physical review letters_, 99(7):070502, 2007

[^peng]: Xinhua Peng, Zeyang Liao, Nanyang Xu, Gan Qin, Xianyi Zhou, Dieter Suter, and Jiangfeng Du. Quantum adiabatic algorithm for factorization and its experimental implementation. _Physical review letters_, 101(22):220405, 2008

[^ralf]: Ralf Schützhold and Gernot Schaller. Adiabatic quantum algorithms as quantum phase transitions: First versus second order. _Physical Review A_, 74(6):060304, 2006

[^xu]: Nanyang Xu, Jing Zhu, Dawei Lu, Xianyi Zhou, Xinhua Peng, and Jiangfeng Du. Quantum factorization of 143 on a dipolar-coupling nuclear magnetic resonance system. _Physical review letters_, 108(13):130501, 2012.

[^amir]: Amir H Karamlou, William A Simon, Amara Katabarwa, Travis L Scholten, Borja Peropadre, and Yudong Cao. Analyzing the performance of variational quantum factoring on a superconducting quantum processor. _npj Quantum Information_, 7(1):156, 2021.

[^soham]: Soham Pal, Saranyo Moitra, VS Anjusha, Anil Kumar, and TS Mahesh. Hybrid scheme for factorisation: Factoring 551 using a 3-qubit nmr quantum adiabatic processor. _Pramana_, 92:1–8, 2019.

[^max]: Max Born and Vladimir Fock. Beweis des adiabatensatzes. _Zeitschrift für Physik_, 51(3):165–180, 1928.

[^morita]: Satoshi Morita and Hidetoshi Nishimori. Mathematical foundation of quantum annealing. _Journal of Mathematical Physics_ , 49(12):125210, 2008.
